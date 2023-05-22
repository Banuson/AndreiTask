public with sharing class task_lcc_accountsPage {
    public static Id parentAccountId;
    public static Integer offset;


/**********************************************************************************************
 * @description This property stores the number of related contact records for each Account
 * @return   Map<Id,Integer>
 *********************************************************************************************/
    public static Map<Id,Integer> totalContactsbyAccountId {
		get {
            Integer totalRecords;
            if (totalContactsbyAccountId == null) {
                totalContactsbyAccountId = new Map<Id, Integer>();
                totalRecords = [SELECT Count() FROM Contact WHERE AccountId = :parentAccountId];
                totalContactsbyAccountId.put(parentAccountId, totalRecords);

			} else if (!totalContactsbyAccountId.containsKey(parentAccountId)) {
                totalRecords = [SELECT Count() FROM Contact WHERE AccountId = :parentAccountId];
                totalContactsbyAccountId.put(parentAccountId, totalRecords);
            }
			return totalContactsbyAccountId;
		}
		set;
	}

    public static final Integer PAGE_SIZE {
		get {
			if (PAGE_SIZE == null) {
				PAGE_SIZE = Page_Size__mdt.getInstance('DataTable').pageSize__c.intValue();
			}
			return PAGE_SIZE;
		}
		set;
	}

    public class ContactWrapper {
        @AuraEnabled public Integer pageNumber {get;set;}
        @AuraEnabled public Integer totalRecords {get;set;}
        @AuraEnabled public Integer pageSize {get;set;}
        @AuraEnabled public Integer recordStart {get;set;}
        @AuraEnabled public Integer recordEnd {get;set;}
        @AuraEnabled public List<Contact> contacts {get;set;}
    }

/**********************************************************************************************
 * @description This method retrieves the account records when the component is loaded
 * @return   TASK_UTL_RESPONSE
 *********************************************************************************************/
   @AuraEnabled(cacheable=true)
    public static TASK_UTL_RESPONSE getInitialAccounts() {
        TASK_UTL_RESPONSE response = new TASK_UTL_RESPONSE();
        try {
            response.isSuccess = true;
            response.response = getAccounts();
        } catch (Exception e) {
            response = new TASK_UTL_RESPONSE(false, null, e);
        }
        return response;
    }
/**********************************************************************************************
 * @description This method retrieves related contact records when an account is selected.
 * @param    pageNumber - Integer, select a given page
 * @param    accountId - String ,  parent AccountId of the related contacts
 * @return   TASK_UTL_RESPONSE
 *********************************************************************************************/
    @AuraEnabled
    public static TASK_UTL_RESPONSE getContactData(Integer pageNumber, String accountId){
        TASK_UTL_RESPONSE response = new TASK_UTL_RESPONSE();
        try {
            offset = (pageNumber - 1) * PAGE_SIZE;
            Integer recordEnd = PAGE_SIZE * pageNumber;
            parentAccountId = accountId;
            Integer totalRecords = totalContactsbyAccountId.get(accountId);

            ContactWrapper contactWrapper =  new ContactWrapper();  
            contactWrapper.pageNumber = pageNumber;
            contactWrapper.recordStart = offset + 1;
            contactWrapper.recordEnd = totalRecords >= recordEnd ? recordEnd : totalRecords;
            contactWrapper.totalRecords = totalRecords;
            contactWrapper.pageSize = PAGE_SIZE;
            contactWrapper.contacts = getContacts();
            response.isSuccess = true;
            response.response = contactWrapper;

        } catch (Exception e) {
            response = new TASK_UTL_RESPONSE(false, null, e);
        }

        return response;

    }    

    public static List<Account> getAccounts(){
        return [
            SELECT Id,
                NAME,
                BillingAddress,
                AnnualRevenue,
                Industry,
                CreatedDate
            FROM Account
            WHERE AnnualRevenue != NULL
        ];
    }

    public static List<Contact> getContacts() {
        return [
            SELECT Id,
                FirstName,
                LastName,
                Email,
                Phone
            FROM Contact
            WHERE AccountId = :parentAccountId
            Order By Name
            LIMIT :PAGE_SIZE
            OFFSET :offset
            ];
    }

   
}