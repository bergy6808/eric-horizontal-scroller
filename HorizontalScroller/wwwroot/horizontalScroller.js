let scrollers = new Map();

export function initScroller(element, dotNetRef, options) {
    var handleResize = () => {
        snapToNearest(element);
        dotNetRef.invokeMethodAsync('ResizedParent', getSizeInfo(element));
    }
    window.addEventListener('resize', handleResize)
    var parentWrapper = element.closest('.parent-wrapper');
    const mutationCallback = (mutationList, observer) => {
        for (const mutation of mutationList) {
            var nodes = Array.from(mutation.removedNodes);
            var directMatch = nodes.indexOf(parentWrapper) > -1
            var parentMatch = nodes.some(parent => parent.contains(parentWrapper));
            if (directMatch || parentMatch) {
                dispose(element);
            }
        }
    };
    const observer = new MutationObserver(mutationCallback);
    observer.observe(document.body, { attributes: false, childList: true, subtree: true });
    scrollers.set(element, {
        isDragging: false,
        velocity: 0,
        lastX: 0,
        animationFrame: null,
        snapTimeout: null,
        currentIndex: 0,
        dotNetRef: dotNetRef,
        observer: observer,
        handleResize: handleResize,
        opts: options
    });
}

export function getSizeInfo(element) {
    var parentWrapper = element.closest('.parent-wrapper');
    return {
        ParentWidth: parentWrapper.offsetWidth,
        ViewportWidth: window.innerWidth
    };
}

export function startDrag(element, clientX) {
    const state = scrollers.get(element);
    if (!state) return;

    state.isDragging = true;
    state.lastX = clientX;
    cancelAnimationFrame(state.animationFrame);
    clearTimeout(state.snapTimeout);
}

export function dragMove(element, clientX) {
    const state = scrollers.get(element);
    if (!state || !state.isDragging) return;

    const delta = clientX - state.lastX;
    element.scrollLeft -= delta;
    state.velocity = delta;
    state.lastX = clientX;
}

export function endDragWithInertia(element) {
    const state = scrollers.get(element);
    if (!state) return;

    state.isDragging = false;
    const minVelocity = 0.6;

    function inertiaScroll() {
        if (Math.abs(state.velocity) < minVelocity) {
            if (state.opts.enableSnapping)
                scheduleSnap(element);
            return;
        }

        element.scrollLeft -= state.velocity;
        state.velocity *= state.opts.inertiaDecay;

        state.animationFrame = requestAnimationFrame(inertiaScroll);
    }

    inertiaScroll();
}

function scheduleSnap(element) {
    const state = scrollers.get(element);
    if (!state) return;

    state.snapTimeout = setTimeout(() => {
        snapToNearest(element);
    }, state.opts.snapDelay);
}

export function snapToNext(element) {
    const items = Array.from(element.querySelectorAll('.scroller-item'))
    const state = scrollers.get(element);

    if (state.currentIndex < items.length - 1) {
        snapToIndex(element, state.currentIndex + 1);
    }
}
export function snapToPrevious(element) {
    const state = scrollers.get(element);

    if (state.currentIndex > 0) {
        snapToIndex(element, state.currentIndex - 1);
    }
}

export function snapToNearest(element) {
    const item = element.querySelector('.scroller-item');
    if (!item) return;

    const itemWidth = item.offsetWidth;
    const currentScroll = element.scrollLeft;
    const nearestIndex = Math.round(currentScroll / itemWidth);
    snapToIndex(element, nearestIndex);
}

export function snapToIndex(element, index) {
    const state = scrollers.get(element);
    const items = Array.from(element.querySelectorAll('.scroller-item'));
    if (items.length == 0 || isNaN(index))
        return;

    if (index < 0)
        index = 0;
    if (index >= items.length)
        index = items.length - 1;
    const scrollAtPositionZero = items[0].offsetLeft
    const targetScroll = items[index].offsetLeft - scrollAtPositionZero;
    var oldIndex = state.currentIndex;
    state.currentIndex = index;
    element.scrollTo({
        left: targetScroll,
        behavior: 'smooth'
    });
    if (oldIndex != state.currentIndex)
        state.dotNetRef.invokeMethodAsync("NotifySnapToIndex", index)
}


function dispose(element) {
    const state = scrollers.get(element);
    if (state) {
        state.observer.disconnect();
        window.removeEventListener('resize', state.handleResize);
        console.log('handler removed');
        scrollers.delete(element);
    }
}