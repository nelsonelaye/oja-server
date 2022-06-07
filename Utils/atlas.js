const { MongoClient, ServerApiVersion } = require("mongodb");
const uri =
  "mongodb+srv://nelson_elaye:nODRTvvJ9CrmhGsZ@cluster0.dbdsr.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});
client.connect((err) => {
  const collection = client.db("Oja").collection("devices");
  // perform actions on the collection object
  client.close();
});

module.exports = client;

// client.connect((err) => {
//     if (err) {
//       console.log(err);
//     } else {
//       const collection = client.db("Oja").collection("devices");
//       // perform actions on the collection object
//       client.close();
//       console.log("New atlas");
//     }
//   });
