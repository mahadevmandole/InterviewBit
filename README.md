# InterviewBit
Interview agent, which can help HR people to shortlist candidates from thousand of applicants

docker compose up --build

docker compose down -v
rm -rf ./data/postgres ./data/mongo
docker compose up -d

docker compose ps
docker compose logs -f postgres
docker compose logs -f backend

docker compose logs -f postgres backend

docker compose restart backend

Verify froent end and backed

curl -I http://localhost:5173
curl -I http://localhost:8000/docs

Verify databases

docker exec -it $(docker compose ps -q postgres) psql -U postgres -l

docker exec -it $(docker compose ps -q postgres) psql -U postgres -d postgres -c "CREATE DATABASE interviewbit;"  If no databas exist

docker exec -it $(docker compose ps -q mongo) mongosh --eval "db.runCommand({ ping: 1 })"

curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "first_name":"John",
    "last_name":"Doe",
    "phone":"+1234567890",
    "email":"john@example.com",
    "password":"StrongPass123"
  }'


curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email":"john@example.com",
    "password":"StrongPass123"
  }'