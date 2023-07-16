# bitespeed

service endpoint:- https://bitespeed-kx36.onrender.com/identify

sample curl
```
curl --location --request POST 'https://bitespeed-kx36.onrender.com/identify' \
--header 'Content-Type: application/json' \
--data-raw '{
    "email": "george@hillvalley.edu",
    "phoneNumber": "123456"
}'
```

1. I have removed all data from table.
2. We can add validator to api for robust system. I didn't find any instruction to add so I skipped.
