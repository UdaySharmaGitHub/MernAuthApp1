class ApiError extends Error{
    constructor(
        statusCode,message = "Something Went Wrong",
        errors = [],stack = "",
    ){
        super(message)
            this.message = message
            this.errors =errors
            this.data = null
            this.statusCode = statusCode
            this.success = false
            if(!stack){
                this.stack =stack
            }else{
                Error.captureStackTrace(this,this.constructor)
            }
    }
}
export {ApiError}