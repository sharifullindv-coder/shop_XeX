import asyncio
from aiogram.filters import CommandStart
from aiogram import Bot, Dispatcher, types, F
from aiogram.types import WebAppInfo, KeyboardButton, ReplyKeyboardMarkup
from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton

def status_keyboard(user_id):
    return InlineKeyboardMarkup(inline_keyboard=[
        [
            InlineKeyboardButton(text="✅ Принят", callback_data=f"ok_{user_id}"),
            InlineKeyboardButton(text="🚚 Отправлен", callback_data=f"send_{user_id}")
        ]
    ])

BOT_TOKEN = "8662122799:AAElbziqat0FVNuu0Dn4KyauC4vCQj-pRaY"
MANAGER_CHAT_ID = 123456789  # ID менеджера
WEB_APP_URL = "http://127.0.0.1:5500/mini_app_aiobot/shop_xex.html"

bot = Bot(token=BOT_TOKEN)
dp = Dispatcher()

# Кнопка для открытия Mini App
web_app_button = KeyboardButton(
    text="🛍 Открыть магазин",
    web_app=WebAppInfo(url=WEB_APP_URL)
)

keyboard = ReplyKeyboardMarkup(
    keyboard=[[web_app_button]],
    resize_keyboard=True
)

# Команда /start
@dp.message(CommandStart())
async def start_handler(message: types.Message):
    username = message.from_user.username
    await message.answer(
        f"👋 Привет, @{username}!\n"
        "Добро пожаловать в магазин вещей!",
        reply_markup=keyboard
    )

# Обработка данных из Mini App
@dp.message(F.web_app_data)
async def handle_web_app_data(message: types.Message):
    data = message.web_app_data.data
    # Уведомление пользователя
    await message.answer("✅ Ваш заказ отправлен! Менеджер скоро свяжется с вами.")
    # Отправка менеджеру
    await bot.send_message(
    MANAGER_CHAT_ID,
    f"📦 Новый заказ!\n\n{data}",
    reply_markup=status_keyboard(message.from_user.id)
)

# Пример уведомления о статусе заказа
async def send_order_status(user_id: int, status: str):
    await bot.send_message(user_id, f"📦 Статус вашего заказа: {status}")

@dp.callback_query()
async def handle_status(callback: types.CallbackQuery):
    action, user_id = callback.data.split("_")
    user_id = int(user_id)

    if action == "ok":
        await bot.send_message(user_id, "✅ Заказ принят")
    elif action == "send":
        await bot.send_message(user_id, "🚚 Заказ отправлен")

    await callback.answer("Статус обновлен")

async def main():
    print('бот запущен...')
    await dp.start_polling(bot)

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print('бот остановлен...')