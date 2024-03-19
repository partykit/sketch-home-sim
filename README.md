# sketch-home-sim

## What is this?

What you'll find here:

- A simple simulation of a smart home system
- An assistant that takes instructions from the user
- The assistant using OpenAI function calling to interaction with the simulation, to achieve its goal

When you run the sim using `npm run dev` there's a web view:

- Left side: A debug view that shows the entire world state (including information unavailable to the assistant, such as the location of movable items like pets and people)
- Right side: The assistant view, including a text input for the user to give instructions, and a view of the assistant's current state (its transcript of messages with OpenAI)

## Navigating around the repo

Looking in `party/`...

There are two parties:

- `server.ts` -- the world sim. Contains world state, and the endpoints for the assistant to interact with the world using functions. Includes a 'sync' WebSocket message so the debug view can see the world state
- `assistant.ts` -- takes an instruction, and includes the function calling logic

There are also utility functions:

- `openai.ts` -- communicates with OpenAI, constraining the response to a single tool call (tool == function)
- `functions.ts` -- the functions that the assistant can call via OpenAI, including an `intentFunction` which is used to decide which actual function to call
- `world.ts` and `messages.ts` -- types and constants

## The function calling loop

When the assistant gets an instruction, it loops around the following steps:

- get the latest world state (the assistant always has access to the layout of the house, the devices in each rooms, and their current state. It does not have access to moveable items, i.e. un-networked pets and people)
- call `intentFunction` using OpenAI to decide which function to call, given the user's instructions
- call the decided function using OpenAI to get the function arguments
- add this function call to the message transcript
- (if the decided function is 'halt', stop here)
- using the function name and arguments, make an HTTP request to the sim in `server.ts` to mutate the world state and get the result
- adds the function call _result_ to the assistant's transcript -- this is essentially the assistant's memory, something that is additional to the world state.

The loop continues until:

- the assistant receives a 'halt' function call -- this also includes the ability to report back to the user
- the assistant hits the maximum number of function calls (currently set to 10)

## Issues and next steps

- The assistant isn't that smart... There's work to be done! World state probably shouldn't be in JSON
- UI needs to be built
- The function calling loop is cumbersome: what would be an idoimatic way to do this?
- Real world integration: could the world sim represent _my house?_ Could the function calls be actual HomeKit calls?
