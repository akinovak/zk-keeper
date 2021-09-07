# Extension
Extension boilerplate containing:
- some basic UI components
- service-oriented background architecture
- injected script

## Development

**Requirement**
- Node v12+

**Install**
```
npm install 
```

**Run in dev mode**
```
NODE_ENV=development npm run dev
```

**Build**
```
NODE_ENV=production npm run build
```


**Injected Script**

From any chrome tab

```
const client = await injected.connect();
client.openPopup(); // this will open pop up
client.setAppText(); // this will update app message on UI

```