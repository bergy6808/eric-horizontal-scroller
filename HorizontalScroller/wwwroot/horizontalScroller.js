let scrollers = new Map();

export function initBhs(element, dotNetRef, options) {
    var handleResize = () => {
        const state = scrollers.get(element);
        log(options, 'resize triggered');

        if (state.lastSnapWidth > 20)
            updateNearest(element);
        snapToNearest(element);
        var sizeInfo = getSizeInfo(element);
        dotNetRef.invokeMethodAsync('ResizedParent', sizeInfo);
    }
    //window.addEventListener('resize', handleResize)
    element.addEventListener('touchmove', e => {
        if (e.touches.length)
            dragMove(element, e.touches[0].clientX)
    });
    element.addEventListener('mousemove', e => {
        dragMove(element, e.clientX)
    });
    element.addEventListener('scrollend', () => {
        const state = scrollers.get(element);
        if (!state) return;
        state.priorityScrollInProgress = false;
    });
    var parentWrapper = element.closest('.bhs');
    // observe body
    const bodyObserver = new MutationObserver((mutationList) => {
        for (const mutation of mutationList) {
            var nodes = Array.from(mutation.removedNodes);
            var directMatch = nodes.indexOf(parentWrapper) > -1
            var parentMatch = nodes.some(parent => parent.contains(parentWrapper));
            if (directMatch || parentMatch) {
                dispose(element);
            }
        }
    });
    bodyObserver.observe(document.body, { attributes: false, childList: true, subtree: true });
    // observe resize
    var resizeObserver = new ResizeObserver((entries) => {
        log(options, 'resize observer triggered');
        handleResize();
    });
    resizeObserver.observe(element);
    // observe visible
    var visibilityObserver = new IntersectionObserver((entries) => {
        log(options, 'visibility observer triggered');
        visibilityChanged(element);
    });
    visibilityObserver.observe(element);

    scrollers.set(element, {
        isDragging: false,
        velocity: 0,
        lastX: 0,
        animationFrame: null,
        snapTimeout: null,
        currentIndex: 0,
        visible: element.offsetParent !== null,
        dotNetRef: dotNetRef,
        lastSnapWidth: 0,
        observers: Array.from([bodyObserver, resizeObserver, visibilityObserver]),
        //handleResize: handleResize,
        nearestIndex: 0,
        opts: options
    });
    log(options, 'initialized');
    if (options.startIndex != 0) {
        log(options, "To start index: " + options.startIndex);
        snapToIndex(element, options.startIndex, 'auto');
    }
}

export function getSizeInfo(element) {
    var parentWrapper = element.closest('.bhs');
    var res = {
        ParentWidth: parentWrapper.offsetWidth || 0,
        ViewportWidth: window.innerWidth || 0
    };
    return res;
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
    updateNearest(element);
}

export function endDrag(element) {
    const state = scrollers.get(element);
    if (!state || !state.isDragging) return;

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
        updateNearest(element);

        state.animationFrame = requestAnimationFrame(inertiaScroll);
    }

    inertiaScroll();
}
function scheduleSnap(element) {
    const state = scrollers.get(element);
    if (!state) return;

    state.snapTimeout = setTimeout(() => {
        if (state.priorityScrollInProgress)
            return;
        updateNearest(element);
        snapToNearest(element);
    }, 100);
}
function updateNearest(element) {
    const item = element.querySelector('.bhs-item');
    if (!item) return;

    const currentScroll = element.scrollLeft;
    const state = scrollers.get(element);

    const items = Array.from(element.querySelectorAll('.bhs-item'));
    if (items.length == 0)
        return; 

    var generalOffset = items[0].offsetLeft;
    var distance = 1000000;
    var nearestIndex = items.length - 1;
    for (var i = 0; i < items.length; i++) {
        var currentDistance = Math.abs(items[i].offsetLeft - generalOffset - currentScroll);
        if (currentDistance < distance || (currentDistance == distance && state.nearestIndex == i)) {
            distance = currentDistance;
            nearestIndex = i;
        }
        else if (currentDistance != 0)
            break;
    }

    if (state && !isNaN(nearestIndex) && state.nearestIndex != nearestIndex) {
        state.nearestIndex = nearestIndex;
        state.dotNetRef.invokeMethodAsync("NotifyNearestIndexChanged", nearestIndex)
    }
}
function getStyle(el, prop) {
    if (typeof getComputedStyle !== 'undefined') {
        return getComputedStyle(el, null).getPropertyValue(prop);
    } else {
        return el.currentStyle[prop];
    }
}
function visibilityChanged(element) {
    const state = scrollers.get(element);
    var was = state.visible;
    state.visible = element.offsetParent !== null;
    if (!was && state.visible) {
        snapToIndex(element, state.currentIndex, 'auto');
    }
}
function getVisibleItems(element, index) {
    var parentWrapper = element.closest('.bhs');
    const state = scrollers.get(element);
    var width = parentWrapper.offsetWidth;
    const items = Array.from(element.querySelectorAll('.bhs-item'));
    if (width == 0)
        return [index];
    var res = [items[index]];
    var spaceTaken = 0;
    for (var i = index; i < items.length; i++) {
        var item = items[i];
        res = res.concat(item);
        spaceTaken += item.offsetWidth + parseInt(getStyle(item, 'margin-right').slice(0, -2));
        if (spaceTaken > width)
            break;
    }
    return res;
}

function log(options, m) {
    if (options.log)
        console.log(m);
}
export function getMaxVisibleHeight(element) {
    const state = scrollers.get(element);
    var index = state.currentIndex;
    var visibleItems = getVisibleItems(element, index);
    var childItems = visibleItems.map(x => x.querySelector('div'));
    childItems.forEach(x => {
        x.style.height = '';
    });
    var heights = Array.from(childItems.map(x => x.offsetHeight));
    var maxHeight = Math.max(...heights);
    childItems.forEach(x => {
        x.style.height = '100%';
    });

    return maxHeight;
}

export function snapToNext(element) {
    const items = Array.from(element.querySelectorAll('.bhs-item'))
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
    const state = scrollers.get(element);
    snapToIndex(element, state.nearestIndex);
}

export function snapToIndex(element, index, scrollToBehavior = 'smooth', priority = true) {
    const state = scrollers.get(element);
    const items = Array.from(element.querySelectorAll('.bhs-item'));
    if (items.length == 0 || isNaN(index))
        return;
    if (!priority && state.priorityScrollInProgress)
        return;

    if (index < 0)
        index = 0;
    if (index >= items.length)
        index = items.length - 1;

    state.lastSnapWidth = getSizeInfo(element).ParentWidth;
    const scrollAtPositionZero = items[0].offsetLeft
    const targetScroll = items[index].offsetLeft - scrollAtPositionZero;
    log(state.opts, 'Snapping to index ' + index + ' | current width ' + state.lastSnapWidth);
    var oldIndex = state.currentIndex;
    state.currentIndex = index;
    state.nearestIndex = index;
    if (state.lastSnapWidth > 20) {
        log(state.opts, 'Scrolling to position ' + targetScroll);
        state.priorityScrollInProgress = priority;
        element.scrollTo({
            left: targetScroll,
            behavior: scrollToBehavior
        });
    }

    if (oldIndex != state.currentIndex)
        state.dotNetRef.invokeMethodAsync("NotifySnapToIndex", index)
}

function dispose(element) {
    const state = scrollers.get(element);
    if (state) {
        state.observers.forEach(o => o.disconnect());
        //window.removeEventListener('resize', state.handleResize);
        log(state.opts, 'Scroller handlers removed');
        scrollers.delete(element);
    }
}