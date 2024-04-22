const { Client } = require('@elastic/elasticsearch')
const client = new Client({
  node: 'htt://e'
})

export default client