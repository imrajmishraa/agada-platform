GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

echo "🏥 Checking Agada service health..."

services=(
  "auth-service:3001"
  "patient-service:3002"
  "triage-service:3003"
  "referral-service:3004"
  "telemed-service:3005"
  "medicine-service:3006"
  "diagnostic-service:3007"
  "queue-service:3008"
  "notification-service:3009"
  "analytics-service:3010"
  "care-graph-service:3011"
  "sync-service:3012"
  "integration-gateway:3013"
)

all_ok=true

for service in "${services[@]}"; do
  name="${service%:*}"
  port="${service#*:}"
  url="http://localhost:$port/healthz"
  
  echo -n "Checking $name on port $port ... "
  
  # Check if service responds with 2xx status
  if curl -s -o /dev/null -w "%{http_code}" --max-time 1 "$url" | grep -q "^2"; then
    echo -e "${GREEN}✅ OK${NC}"
  else
    echo -e "${RED}❌ FAILED${NC}"
    all_ok=false
  fi
done

if [ "$all_ok" = true ]; then
  echo -e "\n${GREEN}✅ All services are healthy.${NC}"
else
  echo -e "\n${RED}❌ Some services failed. Check the logs.${NC}"
fi