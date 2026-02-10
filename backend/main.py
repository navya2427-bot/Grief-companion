from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.database import Base, engine
from backend import models

from backend.auth import router as auth_router
from backend.rooms import router as rooms_router
from backend.ai import router as ai_router
from backend.mood import router as mood_router

from backend.journal import router as journal_router





# 1️⃣ Create FastAPI app
app = FastAPI()


# 2️⃣ Create DB tables
Base.metadata.create_all(bind=engine)


# 3️⃣ Include routers
app.include_router(auth_router, prefix="/auth")
app.include_router(rooms_router)
app.include_router(ai_router)
app.include_router(mood_router)

app.include_router(journal_router)



# 4️⃣ Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # later restrict
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# 5️⃣ Health check
@app.get("/")
def health_check():
    return {"status": "Grief Companion backend running"}
