public inherited sharing class TASK_UTL_RESPONSE {

	@AuraEnabled
	public Boolean isSuccess { get; set; }
	@AuraEnabled
	public Object response { get; set; }
	@AuraEnabled
	public Object apexException {
		get {
			if ( apexException != null ) {
				Map<String, String> res = new Map<String, String> {
						'Type' => ((Exception) apexException).getTypeName(),
						'Message' => ((Exception) apexException).getMessage(),
						'Stacktrace' => ((Exception) apexException).getStackTraceString()
				};
				return res;
			} else {
				return null;
			}
		}
		set;
	}

    /********************************************************************************************************************************************
	* @author         Andrei Banu
	* @description    Default Constructor
	* @date           2023
	********************************************************************************************************************************************/
    public TASK_UTL_RESPONSE() {
		this.isSuccess = false;
	}
    
   /********************************************************************************************************************************************
	* @author         Andrei Banu
	* @description    Default Constructor (with parameters)
	* @date           2023
	* @param		  Boolean isSuccess: the is success value for the response.
	* @param		  Object response: the response.
	* @param		  Exception apexException: The exception, if there is one, a detail will be built from.
	********************************************************************************************************************************************/
    public TASK_UTL_RESPONSE(Boolean isSuccess, Object response, Exception apexException) {
		this.isSuccess = isSuccess;
		this.response = response;
		this.apexException = apexException;
	}

}