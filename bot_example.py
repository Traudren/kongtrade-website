#!/usr/bin/env python3
"""
Пример интеграции торгового бота KongTrade с веб-сайтом
Этот файл показывает как получать данные пользователей и запускать торговлю
"""

import requests
import time
import logging
from datetime import datetime
from typing import List, Dict, Optional
import os
from dotenv import load_dotenv

# Загружаем переменные окружения
load_dotenv()

# Настройка логирования
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('bot.log'),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger(__name__)

# Конфигурация
API_URL = os.getenv('API_URL', 'https://www.kongtrade.com/api/bot/users')
API_KEY = os.getenv('BOT_API_KEY')
STATUS_UPDATE_URL = os.getenv('STATUS_UPDATE_URL', 'https://www.kongtrade.com/api/bot/users')


class KongTradeBot:
    def __init__(self, api_key: str, api_url: str):
        self.api_key = api_key
        self.api_url = api_url
        self.headers = {
            'Authorization': f'Bearer {api_key}',
            'Content-Type': 'application/json'
        }
    
    def fetch_active_users(self) -> List[Dict]:
        """
        Получает список всех активных пользователей с их конфигурациями
        """
        try:
            response = requests.get(
                self.api_url,
                headers=self.headers,
                timeout=10
            )
            response.raise_for_status()
            
            data = response.json()
            if data.get('success'):
                users = data.get('users', [])
                logger.info(f"Fetched {len(users)} active users")
                return users
            else:
                logger.error(f"API returned error: {data.get('error')}")
                return []
                
        except requests.exceptions.RequestException as e:
            logger.error(f"Error fetching users: {e}")
            return []
    
    def update_bot_status(self, user_id: str, bot_status: str, last_activity: Optional[datetime] = None):
        """
        Обновляет статус бота для пользователя
        """
        try:
            url = f"{STATUS_UPDATE_URL}/{user_id}/status"
            payload = {
                'bot_status': bot_status,
                'last_activity': last_activity.isoformat() if last_activity else datetime.now().isoformat()
            }
            
            response = requests.patch(
                url,
                headers=self.headers,
                json=payload,
                timeout=5
            )
            response.raise_for_status()
            
            logger.info(f"Updated status for user {user_id}: {bot_status}")
            return True
            
        except requests.exceptions.RequestException as e:
            logger.error(f"Error updating status: {e}")
            return False
    
    def trade_for_user(self, user: Dict):
        """
        Основная функция торговли для пользователя
        Здесь должна быть ваша логика торговли
        """
        user_id = user['user_id']
        user_name = user['user_name']
        exchange = user['exchange']
        api_key = user['api_key']
        api_secret = user['api_secret']
        profit_limit = user['subscription']['profit_limit']
        days_remaining = user['subscription']['days_remaining']
        
        logger.info(f"Starting trade for user {user_name} (ID: {user_id})")
        logger.info(f"Exchange: {exchange}, Profit limit: {profit_limit}, Days remaining: {days_remaining}")
        
        # Обновляем статус на "running"
        self.update_bot_status(user_id, 'running')
        
        try:
            # ============================================
            # ВАША ЛОГИКА ТОРГОВЛИ ЗДЕСЬ
            # ============================================
            
            # Пример:
            # if exchange == 'binance':
            #     # Подключение к Binance API
            #     # Выполнение торговых операций
            # elif exchange == 'bybit':
            #     # Подключение к Bybit API
            #     # Выполнение торговых операций
            
            # Учитывайте profit_limit при торговле
            # if profit_limit == 'unlim':
            #     # Без ограничений
            # else:
            #     # Ограничение прибыли до profit_limit%
            
            # ============================================
            
            # Симуляция торговли (замените на реальную логику)
            logger.info(f"Trading completed for {user_name}")
            
            # Обновляем статус на "stopped" после завершения
            self.update_bot_status(user_id, 'stopped', datetime.now())
            
        except Exception as e:
            logger.error(f"Error trading for {user_name}: {e}")
            # Обновляем статус на "error"
            self.update_bot_status(user_id, 'error', datetime.now())
            raise
    
    def run_daily_trading(self):
        """
        Запускает торговлю для всех активных пользователей
        Вызывается один раз в день (например, через cron)
        """
        logger.info("=" * 50)
        logger.info("Starting daily trading cycle")
        logger.info(f"Time: {datetime.now().isoformat()}")
        logger.info("=" * 50)
        
        # Получаем активных пользователей
        users = self.fetch_active_users()
        
        if not users:
            logger.warning("No active users found")
            return
        
        # Запускаем торговлю для каждого пользователя
        for user in users:
            try:
                self.trade_for_user(user)
            except Exception as e:
                logger.error(f"Failed to trade for user {user['user_name']}: {e}")
                continue
        
        logger.info("=" * 50)
        logger.info(f"Daily trading cycle completed for {len(users)} users")
        logger.info("=" * 50)
    
    def run_continuous(self, interval_seconds: int = 60):
        """
        Запускает непрерывный цикл проверки и торговли
        Проверяет активных пользователей каждые interval_seconds секунд
        """
        logger.info("Starting continuous trading bot")
        logger.info(f"Check interval: {interval_seconds} seconds")
        
        while True:
            try:
                self.run_daily_trading()
                logger.info(f"Sleeping for {interval_seconds} seconds...")
                time.sleep(interval_seconds)
            except KeyboardInterrupt:
                logger.info("Bot stopped by user")
                break
            except Exception as e:
                logger.error(f"Unexpected error: {e}")
                time.sleep(interval_seconds)


def main():
    """
    Главная функция
    """
    # Проверяем наличие API ключа
    if not API_KEY:
        logger.error("BOT_API_KEY not found in environment variables")
        logger.error("Please set BOT_API_KEY in .env file or environment")
        return
    
    # Создаем экземпляр бота
    bot = KongTradeBot(API_KEY, API_URL)
    
    # Выбираем режим работы
    import sys
    
    if len(sys.argv) > 1 and sys.argv[1] == '--continuous':
        # Непрерывный режим (для тестирования)
        interval = int(sys.argv[2]) if len(sys.argv) > 2 else 60
        bot.run_continuous(interval)
    else:
        # Одноразовый запуск (для cron)
        bot.run_daily_trading()


if __name__ == '__main__':
    main()

