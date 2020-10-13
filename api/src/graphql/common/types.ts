
 export const UtilTypes = `
    type Range {
        from: Int
        to: Int
    }

    enum Status {
        OK
        ERROR
    }

    type Message {
        message: String!
        status: Status!
    }
 `;