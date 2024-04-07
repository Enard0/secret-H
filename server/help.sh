curl -X POST \
-H "Content-Type: application/json" \
-d '{"SessionId":1,"UserId":1,"players":[1,2],"roles":{"L":1,"C":1},"cards":{"L":1,"C":1},"boards":["L1","C1"]}' \
-s localhost:3001/start