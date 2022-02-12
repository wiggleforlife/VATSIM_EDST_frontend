import {configureStore} from "@reduxjs/toolkit";
import aclReducer from './reducers/aclReducer';
import depReducer from './reducers/depReducer';
import sectorReducer from "./reducers/sectorReducer";
import entriesReducer from "./reducers/entriesReducer";


const store = configureStore({
  reducer: {
    acl: aclReducer,
    dep: depReducer,
    sectorData: sectorReducer,
    entries: entriesReducer
  }
});

export default store;

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch
