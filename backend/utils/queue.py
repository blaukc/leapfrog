from typing import Generic, TypeVar
import asyncio

T = TypeVar("T")


class TypedQueue(Generic[T]):
    """
    A type-hinted wrapper around asyncio.Queue.
    Everything here is non-blocking and event-loop friendly.
    """

    def __init__(self, maxsize: int = 0):
        # Changed to asyncio.Queue
        self._queue: asyncio.Queue[T] = asyncio.Queue(maxsize=maxsize)

    # --- Container Dunder Methods ---

    def __len__(self) -> int:
        return self._queue.qsize()

    def __bool__(self) -> bool:
        return not self._queue.empty()

    def __repr__(self) -> str:
        size = self._queue.qsize()
        return f"<TypedQueue object with {size} item(s)>"

    # --- Async Queue Methods ---

    async def put(self, item: T) -> None:
        """
        Puts an item into the queue.
        If the queue is full, it will 'await' until there is space.
        """
        await self._queue.put(item)

    def put_nowait(self, item: T) -> None:
        """
        Puts an item without awaiting.
        Use this inside synchronous functions or when you know the queue isn't full.
        """
        self._queue.put_nowait(item)

    async def get(self) -> T:
        """
        Removes and returns an item.
        If the queue is empty, it 'await's (yields control) until an item arrives.
        """
        return await self._queue.get()

    def task_done(self) -> None:
        """Required if you want to use join() or track task completion."""
        self._queue.task_done()

    # --- Helpers ---

    def qsize(self) -> int:
        return self._queue.qsize()

    def empty(self) -> bool:
        return self._queue.empty()

    def full(self) -> bool:
        return self._queue.full()
