from typing import Generic, TypeVar
import queue

T = TypeVar("T")


class TypedQueue(Generic[T]):
    """
    A type-hinted wrapper around the standard library's queue.Queue
    with dunder methods for container-like behavior.
    """

    def __init__(self, maxsize: int = 0):
        """
        Initialize the queue.

        Args:
            maxsize: The maximum size of the queue. If <= 0, the queue size is infinite.
        """
        self._queue: queue.Queue = queue.Queue(maxsize=maxsize)

    # --- Container Dunder Methods ---

    def __len__(self) -> int:
        """
        Allows using len(my_queue) to get the approximate number of items.
        Corresponds to the qsize() method.
        """
        return self._queue.qsize()

    def __bool__(self) -> bool:
        """
        Allows checking if the queue is empty using 'if my_queue:'.
        Returns True if the queue is not empty, False otherwise.
        Corresponds to the not empty() method.
        """
        return not self._queue.empty()

    def __repr__(self) -> str:
        """
        Provides an informative string representation of the object.
        """
        size = self._queue.qsize()
        return f"<TypedQueue object for type {T} with {size} item(s)>"

    # --- Standard Queue Methods (for completeness and direct usage) ---

    def put(self, item: T, block: bool = True, timeout: float | None = None) -> None:
        """Puts an item into the queue."""
        self._queue.put(item, block=block, timeout=timeout)

    def get(self, block: bool = True, timeout: float | None = None) -> T:
        """Removes and returns an item from the queue."""
        return self._queue.get(block=block, timeout=timeout)

    def qsize(self) -> int:
        """Return the approximate size of the queue (not reliable)."""
        return self._queue.qsize()

    def empty(self) -> bool:
        """Return True if the queue is empty, False otherwise."""
        return self._queue.empty()

    def full(self) -> bool:
        """Return True if the queue is full, False otherwise."""
        return self._queue.full()
