curl -X GET -v \
-H "Content-Type: application/json" \
-d '{"SessionId":1,"UserId":2,"players":[1,2],"roles":{"L":1,"C":1},"cards":{"L":1,"C":1},"boards":["L1","C1"]}' \
-s 127.0.0.1:3001/subscribe/1/2/  

const fetchPromise = fetch("localhost:3001/rejectCard/1/1/");
fetchPromise.then(response => {
  console.log(response);
})