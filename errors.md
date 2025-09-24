## Error Type
Console Error

## Error Message
`DialogContent` requires a `DialogTitle` for the component to be accessible for screen reader users.

If you want to hide the `DialogTitle`, you can wrap it with our VisuallyHidden component.

For more information, see https://radix-ui.com/primitives/docs/components/dialog


    at DialogContent (src\components\ui\dialog.tsx:60:7)
    at DialogPortal (src\components\ui\dialog.tsx:24:10)
    at DialogContent (src\components\ui\dialog.tsx:58:5)
    at LoginButton (src\components\auth\login-button.tsx:30:9)
    at Home (src\app\page.tsx:14:9)

## Code Frame
  58 |     <DialogPortal data-slot="dialog-portal">
  59 |       <DialogOverlay />
> 60 |       <DialogPrimitive.Content
     |       ^
  61 |         data-slot="dialog-content"
  62 |         className={cn(
  63 |           "bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border p-6 shadow-lg duration-200 sm:max-w-lg",

Next.js version: 15.5.3 (Webpack)
