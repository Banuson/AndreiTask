import { LightningElement, wire, api } from 'lwc';
import getInitialAccounts from '@salesforce/apex/task_lcc_accountsPage.getInitialAccounts'
import getContactData from '@salesforce/apex/task_lcc_accountsPage.getContactData';
import {loadStyle} from 'lightning/platformResourceLoader'
import customCss from '@salesforce/resourceUrl/custom';
import { updateRecord } from 'lightning/uiRecordApi';
 
const COLUMNS = [
    {label : '', fieldName : 'rowNumber',type : 'number', initialWidth: 15, cellAttributes: {
        class: {fieldName : 'rowWidth'}, 
    }},
    { label: 'First Name', fieldName: 'FirstName', editable: true, cellAttributes: {
        class : {fieldName : 'missingFirstNameColor'}
    }},
    { label: 'Last Name', fieldName: 'LastName', editable: true, cellAttributes: {
        class : {fieldName : 'missingLastNameColor'}
    }},
    { label: 'Email', fieldName: 'Email', type :'email', editable: true, cellAttributes: {
        class : {fieldName : 'missingEmailColor'}
    } },
    { label: 'Phone', fieldName: 'Phone', type: 'phone', editable: true, cellAttributes: {
        class : {fieldName : 'missingPhoneColor'},
        iconName:{ fieldName: 'iconName'}, iconPosition:'left'
    } }
];
export default class Task_lcp_accountsPage extends LightningElement {
    tableData = null;
    columns = COLUMNS
    isCssLoaded = false;
    selectedRecords = null;
    _selectedId = null;
    showModal = false;
    ignoreModal = false;
    saveDraftValues = null;
    pageSize = null;
    loader = false;
    error = null;
    pageNumber = 1;
    totalRecords = 0;
    totalPages = 0;
    recordEnd = 0;
    recordStart = 0;
    isPrev = true;
    isNext = true;
    accounts = [];
    showData = false;

    @wire(getInitialAccounts)
    retrieveAccounts({data, error}) {
        if (data){
            this.tableData = data.response;
            this.getContacts(true);
            this.selectedId = this.tableData[0].Id;
           
        }
        if(error){
            console.error('error', error);
        }
    }

    async getContacts(initial) {
        if (this.loader == true) await new Promise(resolve => setTimeout(resolve, 300)); //simulate spinner showing on page
        getContactData({ pageNumber: this.pageNumber, accountId : initial ? this.tableData[0].Id : this.selectedId})
        .then(result => {
            this.loader = false;
            if (result.isSuccess) {
                let response = result.response;
                console.log(response);
                this.pageNumber = response.pageNumber;
                this.pageSize = response.pageSize;
                this.totalRecords = response.totalRecords;
                this.recordStart = response.recordStart;
                this.recordEnd = response.recordEnd;
                this.selectedRecords = this.constructContactList(response.contacts);
                this.totalPages =  Math.ceil(parseInt(response.totalRecords) / parseInt(this.pageSize));
                this.isNext = (this.pageNumber == this.totalPages || this.totalPages == 0);
                this.isPrev = (this.pageNumber == 1 || this.totalRecords < this.pageSize);
            }
        })
        .catch(error => {
            this.loader = false;
            console.error('error', error);
        });
    }

    constructContactList(contacts){
        return contacts.map( (item, index) => {
                let dataTableClasses = {
                    'rowWidth' : 'custom-row-number',
                    'missingFirstNameColor' : '' + (item.FirstName ? '' : "slds-theme_info"),
                    'missingLastNameColor' : '' + (item.LastName ? '' : "slds-theme_info"),
                    'missingEmailColor' : '' + (item.Email ? '' : "custom-blue slds-theme_alert-texture"),
                    'missingPhoneColor' : '' + (item.Phone ? '' : "slds-theme_info"),
                    'iconName' : 'standard:call_coaching',
                    'rowNumber' : index + this.recordStart
                }
                return {...item, ...dataTableClasses };
            });
    }

    renderedCallback() {
        if(this.isCssLoaded) return
        this.isCssLoaded = true;
        loadStyle(this, customCss).then(() => {
            console.log('Custom Css Loaded');
        }).catch(error =>{
            console.error('Custom Css Failed');
        })      
    }

    handleNext() {
        this.pageNumber = this.pageNumber + 1;
        this.getContacts();
    }

    handlePrev() {
        this.pageNumber = this.pageNumber - 1;
        this.getContacts();
    }

    handleClick(event) {
        if (this.ignoreModal === false) this.showModal= true;
        this.selectedId = event.target.dataset.recordid;
        this.selectedRecords = this.getContacts(false);
    }

    handleContinue(){
        this.showModal= false;
        this.ignoreModal = true;
        this.showData = true;
    }

    handleCancel(){
        this.showModal= false;
    }

    set selectedId(value){
        if (value != this._selectedId && this._selectedId != null ) {
            let elem = this.template.querySelector(`[data-card="${this._selectedId}"]`)
            elem?.classList.remove('selected');
            this.selectedRecords = null;
            this.pageNumber= 1;
            this.totalPages = 0;
            this.totalRecords = 0;
            this.recordEnd = 0;
            this.recordStart = 0;
        }
        if (this._selectedId != value) this.loader = true;
        this._selectedId = value;
        let elem = this.template.querySelector(`[data-card="${this._selectedId}"]`)
        elem?.classList.add('selected');
       
    }

    get selectedId(){
        return this._selectedId;
    }

    get tableClasses(){
        return  'custom-table ' + (this.showData ? '' : 'custom-blur');
    }

    handleSave(event) {
        this.saveDraftValues = event.detail.draftValues;
        const recordInputs = this.saveDraftValues.slice().map(draft => {
            const fields = Object.assign({}, draft);
            return { fields };
        });

        const promises = recordInputs.map(recordInput => updateRecord(recordInput));

        Promise.all(promises).then(res => {
            const elem = this.template.querySelector('c-task_lcp_notification');
            if (elem) {
                elem.showToast('Records Updated Successfully!', 'success');
            }
            console.log(elem);
            this.saveDraftValues = [];
            this.getContacts(false);
        
        }).catch(error => {
            const elem = this.template.querySelector('c-task_lcp_notification');
            if (elem) {
                elem.showToast('Records failed to update', 'error');
            }
            console.error('error', error);
        }).finally(() => {
            this.saveDraftValues = [];
        });
    }
}
 