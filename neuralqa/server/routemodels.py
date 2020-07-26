

from pydantic import BaseModel
from typing import Optional


class Document(BaseModel):

    max_documents: Optional[int] = 5
    question: str = "what is a fourth amendment right violation? "
    fragment_size: int = 250
    retriever: Optional[str] = None
    expander: Optional[str] = None
    relsnip: Optional[bool] = True


class Answer(BaseModel):

    max_documents: Optional[int] = 5
    question: str = "what is a fourth amendment right violation? "
    fragment_size: int = 250
    tokenstride: int = 50
    context: Optional[str] = "The fourth amendment kind of protects the rights of citizens .. such that they dont get searched"
    reader: str = None
    relsnip: bool = True
    retriever: Optional[str] = "manual"


class Explanation(BaseModel):
    question: str = "what is a fourth amendment right violation? "
    context: str = "The fourth amendment kind of protects the rights of citizens .. such that they dont get searched"
