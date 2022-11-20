const express=require('express');
const app=express();
const cors=require('cors')
const port =process.env.PORT || 5000; //process er env te kono port thakle seita use krbe nhle 5000 ta use krbe ar ki.
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const { application } = require('express');
require('dotenv').config();

//middlewares
app.use(cors());
app.use(express.json());//jhokon server side theke database a kono kichu post krbo thokon json convert krar jnno eita ekta autometic middleware.

// console.log(process.env.DB_USER)
// console.log(process.env.DB_PASSWORD)

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.0vbsoxh.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run(){
  try{
    const serviceCollection=client.db('geniusCar').collection('services');
    const orderCollection=client.db('geniusCar').collection('order');

    //nicher ta holo CRUD operation er Read opeartion.ekhane Mongodb te indert kra full dataset kei Read kra hoyece.ei whole data er link ta amra client side er service.js a fetch kreci. 
     app.get('/services',async(req,res)=>{
        const query={}
        const cursor=serviceCollection.find(query);
        const services=await cursor.toArray();
        res.send(services);
     });
   
     //Abr oi full dataset theke jodi kono amra specific data ke tar specific id dara load kre Read krte chai thle nicher onujayy krbo.Ar ei specific data er link take ke amra loader use kre Routes coponent er Checkout component a use kreci tar specfic id dara.tar Checkout component a destructure kre ja ja drkr ta niaci.
     app.get('/services/:id',async(req,res)=>{
        const id=req.params.id;
        const query={_id:ObjectId(id)};
        const service=await serviceCollection.findOne(query);
        res.send(service);
     });

    app.get('/orders',async(req,res)=>{
        let query={};
        if(req.query.email){//jodi req er moddhe query er modhhe email er value ta thake thle (read nicher line)
           query={//ekahne amra query er value ta ke change kre dibo and ble query ke ble dibo query ke ekta object hoite and sekhane email address er sathe milate chai tai ekahne email address ke filter krbo jat man hbe req.query.email
             email:req.query.email
           } 
        }
        const cursor=orderCollection.find(query);
        const orders=await cursor.toArray();
        res.send(orders);
    })

    //orders API: akhn ekhane amra CRUD operation er create operation krbo data create krar jnno.Ar eita ke amader client side theke call krte hbe.it means data ke fetch krte hbe.then Backend a send krte hbe.
    app.post('/orders',async(req,res)=>{
        const order=req.body;
        const result=await orderCollection.insertOne(order);
        res.send(result);
    });

 //order list ke update krar jnno
  app.patch('/orders/:id',async(req,res)=>{
     const id =req.params.id;
     const status=req.body.status;
     const query={_id:ObjectId(id)}
     const updatedDoc={
       $set:{
          status:status
       }
     }
      const result=await orderCollection.updateOne(query,updatedDoc);
      res.send(result);
  })

    //Delete operation.Client side er OrdersRow.js a delete er kaj ta krano hoyece.
    app.delete('/orders/:id',async(req,res)=>{
      const id =req.params.id;
      const query={_id:ObjectId(id)}//kon product/element ke delete krte chai tar id ta amra query er maddhome nia nibo.
      const result=await orderCollection.deleteOne(query);//ekahe order je diaci sei order er collection theke ekta ekta kre id wala product er, delete er jnno query kra id er sathe mile jaoa id product gulor delete er jnno await krte hbe.
      res.send(result);
    })

  }  
  finally{

  }
}
run().catch(err=>console.error(err));

app.get('/',(req,res)=>{
    res.send('genius car server is running');
})

app.listen(port,()=>{
    console.log(`Genius car server running On ${port}`);
})