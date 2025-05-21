# 📦 BlazorHorizontalScroller

A lightweight horizontal scroller component for Blazor WebAssembly and Blazor Server apps. Supports inertia-based dragging, snapping, item spacing, overflow control, and carousel mode — with smooth, touch-friendly interactions powered by JavaScript interop. 

It is meant to be a super lightweight version of Slick Carousel, so I didn't include fancy stuff, but you can code some yourself using the callbacks. 

This nuget is subject to big changes, use with precaution.

> **Big thanks to ChatGPT for assisting in creating this component!**

---

## ✨ Features

- No external dependencies
- Carousel mode with responsive slides-per-view control
- Customizable overflow behavior
- Optional inertia and decay-based drag scrolling
- Snap-to-item enabled by default with configurable delay
- Supports mouse, touch, and programmatic scrolling

---

## 📦 Installation

Add the NuGet package to your project (assuming you're publishing it):

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

| Parameter                        | Type                           | Default     | Description |
|:--------------------------------|:--------------------------------|:------------|:-------------|
| `Items`                          | `IEnumerable<TItem>`             | **Required** | Collection of items to render |
| `ItemTemplate`                   | `RenderFragment<TItem>`          | **Required** | Template for each item |
| `ItemSpacing`                    | `string`                        | `"1rem"`    | Spacing between items |
| `AllowOverflow`                  | `bool`                          | `false`     | Allow horizontal overflow |
| `OverflowViewportWidth`          | `string`                        | `"100%"`    | Width of the viewport when overflow is enabled |
| `OverflowAllowedWidthOnLeft`     | `string`                        | `"10rem"`   | Width of allowed overflow on the left |
| `EndSpacerWidth`                 | `string`                        | `"300px"`   | Space after the last item |
| `EnableInertia`                  | `bool`                          | `true`      | Enable inertia scrolling |
| `InertiaDecay`                   | `double`                        | `0.9`       | Decay rate of inertia |
| `EnableDrag`                     | `bool`                          | `true`      | Enable drag interactions |
| `EnableSnapping`                 | `bool`                          | `true`      | Snap to the nearest item after drag |
| `SnapDelay`                      | `int`                           | `100`       | Delay before snapping (ms) |
| `CarouselMode`                   | `bool`                          | `false`     | Enable carousel-like behavior |
| `CarouselItemsPerSlideSelector`  | `Func<WidthInfo?, int>`         | `_ => 1`    | Number of items per slide based on viewport width |
| `OnSnappedToIndex`               | `EventCallback<int>`            | —            | Invoked when snapped to an item |

---

## 📱 Methods

| Method               | Description |
|:--------------------|:-------------|
| `SnapToNextAsync()`   | Programmatically snap to the next item |
| `SnapToPreviousAsync()` | Programmatically snap to the previous item |

---

## 📊 `WidthInfo` Struct

```csharp
public record WidthInfo(double ParentWidth, double ViewportWidth);
```

Useful for responsive calculations in your `CarouselItemsPerSlideSelector` delegate.

---

## 📜 Notes

- When `AllowOverflow` is `true`, you might need to apply `overflow-x: hidden` to a parent container to prevent unwanted page scrollbars.
- The component relies on a JS module (`horizontalScroller.min.js`) for drag, inertia, and snapping behavior. Make sure it’s properly published in your `_content/BlazorHorizontalScroller/` directory.

---

## 📣 License

MIT License — free to use, modify, and distribute.
