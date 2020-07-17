

from pydantic import BaseModel
from typing import Optional


class Document(BaseModel):

    result_size: Optional[int] = 5
    question: str = "what is a fourth amendment right violation? "
    highlight_span: int = 250
    retriever: str = None


class Answer(BaseModel):

    result_size: Optional[int] = 5
    question: str = "what is a fourth amendment right violation? "
    highlight_span: int = 250
    token_stride: int = 50
    context: str = "The fourth amendment kind of protects the rights of citizens .. such that they dont get searched"
    reader: str = None
    relsnip: bool = True
    retriever: Optional[str] = "manual"


class Explanation(BaseModel):
    question: str = "what is a fourth amendment right violation? "
    context: str = "The fourth amendment kind of protects the rights of citizens .. such that they dont get searched"
