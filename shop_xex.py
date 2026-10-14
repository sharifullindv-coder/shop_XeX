import asyncio
import json
from datetime import datetime

import shop_token
from aiogram import Bot, Dispatcher, F, types
from aiogram.filters import CommandStart
from aiogram.types import InlineKeyboardButton, InlineKeyboardMarkup
from aiogram.types import KeyboardButton, ReplyKeyboardMarkup, WebAppInfo


API_TOKEN = shop_token.TOKEN
MANAGER_CHAT_ID = 123456789  # Замените на Telegram ID менеджера или ID чата с заказами.
WEB_APP_URL = "https://kikshop.modskik.ru"

bot = Bot(token=API_TOKEN)
dp = Dispatcher()


def status_keyboard(user_id: int) -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup(
        inline_keyboard=[
            [
                InlineKeyboardButton(text="Принят", callback_data=f"ok_{user_id}"),
                InlineKeyboardButton(text="Отправлен", callback_data=f"send_{user_id}"),
            ]
        ]
    )


web_app_button = KeyboardButton(
    text="Открыть магазин",
    web_app=WebAppInfo(url=WEB_APP_URL),
)

keyboard = ReplyKeyboardMarkup(
    keyboard=[[web_app_button]],
    resize_keyboard=True,
)


def money(value: int | float) -> str:
    return f"{int(value):,}".replace(",", " ") + " ₽"


def format_order(data: dict, message: types.Message) -> str:
    customer = data.get("customer") or {}
    items = data.get("items") or []
    telegram_user = data.get("telegramUser") or {}
    created_at = data.get("createdAt")

    try:
        created_label = datetime.fromisoformat(str(created_at).replace("Z", "+00:00")).strftime("%d.%m.%Y %H:%M")
    except (TypeError, ValueError):
        created_label = "не указано"

    lines = [
        "Новый заказ одежды",
        "",
        f"Дата: {created_label}",
        f"Клиент: {customer.get('name') or 'не указано'}",
        f"Контакт: {customer.get('contact') or 'не указано'}",
        f"Город доставки: {customer.get('city') or 'не указано'}",
    ]

    username = telegram_user.get("username") or message.from_user.username
    if username:
        lines.append(f"Telegram: @{username}")

    if customer.get("comment"):
        lines.extend(["", f"Комментарий: {customer['comment']}"])

    lines.extend(["", "Товары:"])
    total = 0

    for index, item in enumerate(items, start=1):
        name = item.get("name") or "Товар"
        category = item.get("category") or "Без категории"
        qty = int(item.get("qty") or 1)
        price = int(item.get("price") or 0)
        size = item.get("size") or "не указан"
        color = item.get("color") or "не указан"
        note = item.get("note")
        image = item.get("image")
        total += price * qty

        lines.append(
            f"{index}. {name} ({category}) - {qty} шт. x {money(price)} = {money(price * qty)}"
        )
        lines.append(f"   Размер: {size}; цвет: {color}")
        if note:
            lines.append(f"   Макет: {note}")
        if image:
            lines.append(f"   Изображение товара: {image}")

    order_total = int(data.get("total") or total)
    lines.extend(["", f"Итого: {money(order_total)}"])

    return "\n".join(lines)


@dp.message(CommandStart())
async def start_handler(message: types.Message):
    username = f"@{message.from_user.username}" if message.from_user.username else message.from_user.first_name
    await message.answer(
        f"Привет, {username}!\n"
        "Добро пожаловать в магазин одежды на заказ. Соберите корзину в Mini App, "
        "а менеджер свяжется с вами для согласования макета, оплаты и отправки.",
        reply_markup=keyboard,
    )


@dp.message(F.web_app_data)
async def handle_web_app_data(message: types.Message):
    raw_data = message.web_app_data.data

    try:
        order_data = json.loads(raw_data)
    except json.JSONDecodeError:
        await message.answer("Не удалось прочитать заказ. Попробуйте оформить его еще раз.")
        return

    items = order_data.get("items")
    if not isinstance(items, list) or not items:
        await message.answer("Корзина пустая. Добавьте товары и отправьте заказ еще раз.")
        return

    manager_text = format_order(order_data, message)

    await bot.send_message(
        MANAGER_CHAT_ID,
        manager_text,
        reply_markup=status_keyboard(message.from_user.id),
    )

    await message.answer(
        "Ваш заказ отправлен менеджеру.\n"
        "Он свяжется с вами для дальнейшего согласования макета, оплаты и отправки."
    )


@dp.callback_query(F.data.startswith(("ok_", "send_")))
async def handle_status(callback: types.CallbackQuery):
    action, user_id = callback.data.split("_", maxsplit=1)
    user_id = int(user_id)

    if action == "ok":
        await bot.send_message(user_id, "Заказ принят менеджером. Скоро с вами свяжутся.")
        await callback.answer("Статус: принят")
    elif action == "send":
        await bot.send_message(user_id, "Заказ отмечен как отправленный.")
        await callback.answer("Статус: отправлен")


async def main():
    print("Бот запущен...")
    await dp.start_polling(bot)


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("Бот остановлен...")
