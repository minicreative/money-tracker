module.exports = {
    ObjectProperties: (schema) => {
        schema.add({
            'guid': {
                'type': String,
                'index': true,
                'unique': true
            },
            'lastModified': {
                'type': Number,
                'index': true
            },
            'erased': {
                'type': Boolean,
                'default': false,
                'index': true
            }
        })
    },
    ObjectMethods: (schema) => {
        
    }
}