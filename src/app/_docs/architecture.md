# Architecture

## Global PubSub Events

right now, when the cocktail-ingredients component mounts in dev, the `useEffect` which calls out to `askLLM` is called twice. this is because of how react works in dev mode.

this need makes me want to reach for a global pubsub event system. like redux-dispatch with redux-saga. but I dont need any state management since Im leveraging evolu-sqlite for all my state.

in my current architecture I make requests to the api for data and then write that data as the client.

in addition to having this 2-mount issue, Im also worried about the coupling of components with architecture. all my components are now smart, when in redux land, they were nice and dumb. is this enough of a concern to warrant a global pubsub event system?

another concern, if I navigate away from a page that is running a request then the request has no one to return to. if I had a global-arch, then the request could finish even if the user is on another page.

another concern, when getting a cocktail recipe, there may be need to create new ingredients and new ingredient recipes. this is kinda outside the concern of just the component in view.

also, whatever I move into arch, could be more easily moved into a service worker/server worker if I want that.

also, whatever I move into arch, will be more testable.

what is the lightest way to implement a global pubsub event system in react?

the `sub` part is actually already handled by evolu via useQuery. so I just need the `pub` part.

I think I want a global async publisher that wraps evolu.

what would the DX look like? what about loading states? how would I handle that? - would I have one local only table for loading states? seems like Im recreating a bit of what rkt-query does.

I want to fire off an async-action and know about its state.

```jsx
import { pub } from 'pubsub';

const MyComponent = () => {
  const { pub } = usePubSub();

  return (
    <div>
      <button onClick={() => pub('my-event', { data: 'hello' })}>
        Click me
      </button>
    </div>
  );
};
```
