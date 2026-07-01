import { db } from "./server/services/firebase.ts";

db.collection("test")
  .add({ msg: "hello fallback" })
  .then((doc: any) => {
    console.log("Success with Doc ID:", doc.id);
    return doc.get();
  })
  .then((snapshot: any) => {
    console.log("Snapshot data retrieved:", snapshot.data());
  })
  .catch((err: any) => console.error(err));

