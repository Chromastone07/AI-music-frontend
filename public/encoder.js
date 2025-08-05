// public/encoder.js
self.onmessage = function(event) {
  const arrayBuffer = event.data;
  const uint8Array = new Uint8Array(arrayBuffer);
  let binaryString = '';
  for (let i = 0; i < uint8Array.length; i++) {
    binaryString += String.fromCharCode(uint8Array[i]);
  }
  const base64String = self.btoa(binaryString);
  self.postMessage(base64String);
};