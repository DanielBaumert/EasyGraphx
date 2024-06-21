import { initializeApp } from "firebase/app";
import { addDoc, collection, getFirestore, onSnapshot } from "firebase/firestore";
import { setStore, store } from "./Store";

const firebaseConfig = {
  apiKey: "AIzaSyCt2wFsZ3HW3IMbsAvPup37MohMii8qdDI",
  authDomain: "webrtc-test-e1284.firebaseapp.com",
  projectId: "webrtc-test-e1284",
  storageBucket: "webrtc-test-e1284.appspot.com",
  messagingSenderId: "1057502405233",
  appId: "1:1057502405233:web:bb1cb76bcd968be534b1d0"
};

const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);

async function onShare() {
  if(store.rtc.pc) {
    console.log("Already connected");
    return;
  } 
  const pc = openP2PConnection((event) => {
    console.log("Message received", event.data);
  });

  // the real connection
  const callCollection = collection(firestore, "calls");
  const callDoc = await addDoc(callCollection, {});
  console.log(callDoc.id);
  
  const offerCandidates = collection(callDoc, "offerCandidates");
  const answerCandidates = collection(callDoc, "answerCandidates");
  pc.onicecandidate = async event => {
    if (event.candidate) {
      try {
        await addDoc(offerCandidates, event.candidate.toJSON());
      } catch (error) {
        console.error(`Error adding offer candidate to Firestore: ${error}`);
      }
    }
  }

  // Create offer
  try {
    const offerDescription = await pc.createOffer();
    await pc.setLocalDescription(offerDescription);

    const offer = {
      sdp: offerDescription.sdp,
      type: offerDescription.type,
    };

    await setDoc(callDoc, { offer });
    // Listen for remote answer
    onSnapshot(callDoc, (snapshot) => {
      const data = snapshot.data();
      if (!pc.currentRemoteDescription && data?.answer) {
        const answerDescription = new RTCSessionDescription(data.answer);
        pc.setRemoteDescription(answerDescription);
      }
    });
    // When answered, add candidate to peer connection
    onSnapshot(answerCandidates, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const candidate = new RTCIceCandidate(change.doc.data());
          pc.addIceCandidate(candidate);
        }
      });
    });

    setStore("rtc", "pc", pc);
  } catch (error) {
    console.error(`Error creating offer or setting local description: ${error}`);
  }
}


