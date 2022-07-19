# next-overlay

Overlay UI for Next.js applications

[Example](https://next-overlay-example.vercel.app/)

```jsx
const { visible, raise, dismiss } = useOverlay()

return (
  <>
    <button onClick={raise}>Raise dialog</button>
    {visible ? <Dialog dismiss={dismiss} /> : null}
  </>
)
```

- Visibility control with methods (`raise`, `dismiss`)
- Visibility control with history navigation (back, forward)

