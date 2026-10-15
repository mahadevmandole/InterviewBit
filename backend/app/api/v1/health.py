from fastapi import APIRouter

router = APIRouter(tags=['health'])


class HealthAPI:
    @staticmethod
    def health_check() -> dict[str, str]:
        return {'status': 'ok'}


health_api = HealthAPI()
router.add_api_route('/health', health_api.health_check, methods=['GET'])
