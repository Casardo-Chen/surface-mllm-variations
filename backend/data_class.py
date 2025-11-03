from pydantic import BaseModel

class GroupedResult(BaseModel):
    value: str
    source: list[list[int, str]]

class GroupedResults(BaseModel):
    grouped_results: list[GroupedResult]

class AtomicFact(BaseModel):
    atomic_facts: list[str]

class Sentences(BaseModel):
    descriptions: list[str]
    inferences: list[str]