import { LightningElement, api } from 'lwc';

export default class Task_lcp_notification extends LightningElement {
    showNotification = false
    message
    variant

    get notifyClasses(){
        let variantClass = this.variant === 'success' ? 'slds-theme_success':
        this.variant === 'warning' ? 'slds-theme_warning':
        this.variant === 'error' ? 'slds-theme_error':'slds-theme_info'
        return `slds-notify slds-notify_toast ${variantClass}`
    }
    @api showToast(message, variant){
        this.message = message || "Missing message"
        this.variant = variant || 'error'
        this.showNotification = true
        setTimeout(()=>{
            this.showNotification = false
        },5000 )
    }
}