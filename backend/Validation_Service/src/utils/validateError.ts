export class CustomError {
    error = true
    /**
     * @type {string}
     */
    message
    /**
     * @type {any}
     */
    data
    /**
     * @param {string} message
     * @param {any} data 
     */
    constructor(message: string, data: any) {
        this.data = data
        this.message = message
    }
}