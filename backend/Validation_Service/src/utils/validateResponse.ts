export class CustomResponse {
    /**
     * @type {any}
     */
    data
    error = false
    message = null
    /**
     * @param {any} data 
     */
    constructor(data: any) {
        this.data = data

    }
}