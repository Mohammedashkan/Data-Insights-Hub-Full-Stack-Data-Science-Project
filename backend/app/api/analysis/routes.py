from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.schemas.analysis import AnalysisRequest, AnalysisResponse
from app.services.analysis_service import run_analysis
from app.models.user import User
from app.core.security import get_current_user

router = APIRouter()

@router.post("/", response_model=AnalysisResponse)
async def create_analysis(
    request: AnalysisRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Create and run a new analysis job on a dataset
    """
    try:
        # Start analysis in background
        analysis_id = await run_analysis(
            dataset_id=request.dataset_id,
            analysis_type=request.analysis_type,
            parameters=request.parameters,
            user_id=current_user.id,
            background_tasks=background_tasks,
            db=db
        )
        
        return {
            "analysis_id": analysis_id,
            "status": "processing",
            "message": "Analysis job started successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))