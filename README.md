# 📦 BlazorHorizontalScroller

A lightweight horizontal scroller component for Blazor WebAssembly and Blazor Server apps. Supports inertia-based dragging, snapping, item spacing, overflow control, and carousel mode — with smooth, touch-friendly interactions powered by JavaScript interop. 

It is meant to be a super lightweight version of Slick Carousel, so some fancy stuff is not there, but you can code some yourself using the callbacks. 

---

## ✨ Features

- No external dependencies
- Optional Items-per-view control, to have a carousel
- Customizable overflow behavior
- Optional inertia and decay-based drag scrolling
- Snap-to-item enabled by default with configurable delay
- Supports mouse, touch, and programmatic scrolling

---

## 📦 Installation

Add the NuGet package to your project:

```bash
dotnet add package BlazorHorizontalScroller
```

<!-- Then, reference the JavaScript file in your `index.html` (WASM) or `_Host.cshtml` (Server):

```html
<script src="_content/BlazorHorizontalScroller/horizontalScroller.min.js"></script>
``` -->

Then, add this in the file you want to use

```razor
@using BlazorHorizontalScroller
```
---

## 🔧 Usage

### Basic Example

```razor
<HorizontalScroller Items="myItems">
        <ItemTemplate>
            <div>
                @context
            </div>
        </ItemTemplate>
</HorizontalScroller>
```

### Sliding cards overflowing example
When using AllowOverflow=true, you should style some ancestor with `overflow-x: hidden;` to delimit the overflow. It will avoid the overflow going out of the page. But don't set it on the body tag, as this will prevent your whole page from using `position: sticky;`. 
```razor
<HorizontalScroller Items="myItems"
                    ItemTemplate="item => @<div class='card' style='width: 70vw;max-width: 70vw;'>@item</div>"
                    ItemSpacing="2rem"
                    AllowOverflow="true" />
```

### Carousel example

```razor
@using BlazorHorizontalScroller
<HorizontalScroller Items="myItems"
                    ItemTemplate="item => @<div class='card'>@item</div>"
                    CarouselMode="true"
                    CarouselItemsPerSlideSelector="info => info!.ViewportWidth > 800 ? 3 : 1" />
```

---

## 📐 Parameters

| Parameter                    | Type                     | Default      | Description                                                               |
| :--------------------------- | :----------------------- | :----------- | :------------------------------------------------------------------------ |
| `Items`                      | `IEnumerable<TItem>`     | **Required** | Collection of items to render                                             |
| `ItemTemplate`               | `RenderFragment<TItem>`  | **Required** | Template for each item (use `@context` to access item)                    |
| `AllowOverflow`              | `bool`                   | `false`      | Allows horizontal overflow (requires outer `overflow-x: hidden`)          |
| `ItemSpacing`                | `string`                 | `"1rem"`     | Spacing between items                                                     |
| `ItemWidth`                  | `string`                 | `"auto"`     | Width of each item (overrides `ItemsPerSlideSelector` if set)             |
| `OverflowViewportWidth`      | `string`                 | `"100%"`     | Width of viewport container when `AllowOverflow` is enabled               |
| `OverflowAllowedWidthOnLeft` | `string`                 | `"10rem"`    | Allowed overflow width on the left                                        |
| `EndSpacerWidth`             | `string`                 | `"300px"`    | Space after the last item                                                 |
| `InertiaDecay`               | `double`                 | `0.9`        | Decay rate of inertia speed (1.0 = infinite scroll)                       |
| `EnableDrag`                 | `bool`                   | `true`       | Enables drag-to-scroll with mouse/touch                                   |
| `EnableSnapping`             | `bool`                   | `true`       | Enables snap-to-item behavior after drag                                  |
| `AdjustHeightOnSnap`         | `bool`                   | `false`      | Will avoid visible cards to be to high because of other cards             |
| `CarouselMode`               | `bool` *(Obsolete)*      | —            | **Deprecated:** use `ItemsPerSlideSelector` and don't specify `ItemWidth` |
| `ItemsPerSlideSelector`      | `Func<WidthInfo?, int>?` | `null`       | If `ItemWidth` is `"auto"`, defines items per slide based on width info   |
| `SelectedIndex`              | `int`                    | `0`          | Sets the currently selected slide index                                   |
| `SelectedIndexChanged`       | `EventCallback<int>`     | —            | Callbac                                                                   |



---

## 📱 Methods

| Method                             | Return Type | Description                                                                                   |
| :--------------------------------- | :---------- | :-------------------------------------------------------------------------------------------- |
| `Task SnapToNextItem()`            | `Task`      | Scrolls to the next item.                                                                     |
| `Task SnapToNextSlide()`           | `Task`      | Scrolls to the next slide (number of items per slide depends on `ItemsPerSlideSelector`).     |
| `Task SnapToPreviousItem()`        | `Task`      | Scrolls to the previous item.                                                                 |
| `Task SnapToPreviousSlide()`       | `Task`      | Scrolls to the previous slide (number of items per slide depends on `ItemsPerSlideSelector`). |
| `Task SnapToItemIndex(int index)`  | `Task`      | Scrolls to a specific item by its index.                                                      |
| `Task SnapToSlideIndex(int index)` | `Task`      | Scrolls to a specific slide by its index (calculated by `ItemsPerSlideSelector`).             |
| `Task SyncWidth()`                 | `Task`      | Triggers manually recalculation of available width


---

## 📊 `WidthInfo` Struct

```csharp
public record WidthInfo(double ParentWidth, double ViewportWidth);
```

Useful for responsive calculations in your `CarouselItemsPerSlideSelector` delegate. If null, it means it's the first render.

---

## 📜 Notes

- When `AllowOverflow` is `true`, you might need to apply `overflow-x: hidden` to a parent container to prevent unwanted page scrollbars.
- The component relies on a JS module (`horizontalScroller.min.js`) for drag, inertia, and snapping behavior. Make sure it’s properly published in your `_content/BlazorHorizontalScroller/` directory.

---

## 📣 License

MIT License — free to use, modify, and distribute.
