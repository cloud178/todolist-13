import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
// import {Dispatch} from "@reduxjs/toolkit"
import { Todolist } from "@/features/todolists/api/todolistsApi.types.ts"
import { todolistsApi } from "@/features/todolists/api/todolistsApi.ts"

export type DomainTodolist = Todolist & {
  filter: FilterValues
}

export type FilterValues = "all" | "active" | "completed"

export const todolistsSlice = createSlice({
  name: "todolist",
  initialState: [] as DomainTodolist[],
  reducers: (create) => ({
    // пишем тут отдельно fetchTodolistsAC либо уже через тот синтаксис санки с эксраредьюсерами
    // fetchTodolistsAC: create.reducer<{ todolists: Todolist[] }>((_state, action) => {
    //   return action.payload.todolists.map((todolist) => ({ ...todolist, filter: "all" }))
    //   // эта херня называется что ли hot module replacement или как-то так, так что forEach лучше не использовать
    //   // action.payload.todolists.forEach((todolist) => {
    //   //   _state.push({ ...todolist, filter: "all" })
    //   // })
    // }),

    // deleteTodolistAC: create.reducer<{ id: string }>((state, action) => {
    //   const index = state.findIndex((todolist) => todolist.id === action.payload.id)
    //   if (index !== -1) {
    //     state.splice(index, 1)
    //   }
    // }),
    // пишем тут отдельно changeTodolistTitleAC либо уже через тот синтаксис санки с эксраредьюсерами
    // changeTodolistTitleAC: create.reducer<{ id: string; title: string }>((state, action) => {
    //   const index = state.findIndex((todolist) => todolist.id === action.payload.id)
    //   if (index !== -1) {
    //     state[index].title = action.payload.title
    //   }
    // }),
    changeTodolistFilterAC: create.reducer<{ id: string; filter: FilterValues }>((state, action) => {
      debugger
      // todo debugging
      // state чтобы увидеть надо его кинуть в current, например:
      // console.log(current(state))
      // либо просто стейт посмотреть там base_
      const todolist = state.find((todolist) => todolist.id === action.payload.id)
      if (todolist) {
        todolist.filter = action.payload.filter
      }
    }),
    // createTodolistAC: create.reducer<{ title: string; id: string }>((state, action) => {
    //   state.push({ id: action.payload.id, title: action.payload.title, filter: "all" })
    // }),
    // createTodolistAC: create.reducer<string>((state, action) => {
    //   state.push({ id: nanoid(), title: action.payload, filter: "all" })
    // }),
    // createTodolistAC: create.preparedReducer(
    //   (title: string) => ({
    //     payload: { title, id: nanoid() },
    //   }),
    //   (state, action) => {
    //     const newTodolist: DomainTodolist = {
    //       ...action.payload,
    //       filter: "all",
    //       order: 1,
    //       addedDate: "",
    //     }
    //     state.push(newTodolist)
    //   },
    // ),
  }),
  extraReducers: (builder) => {
    builder
      .addCase(fetchTodolistsTC.fulfilled, (_state, action) => {
        return action.payload.todolists.map((todolist) => ({ ...todolist, filter: "all" }))
      })
      // кейс для обработки ошибок, сюда попадём ниже из ниже где catch. Но мы так вроде делать не будем а будем как-то по другому
      // .addCase(fetchTodolistsTC.rejected, (_state, action) => {
      //
      // })
      .addCase(changeTodolistTitleTC.fulfilled, (state, action) => {
        const index = state.findIndex((todolist) => todolist.id === action.payload.id)
        if (index !== -1) {
          state[index].title = action.payload.title
        }
      })
      .addCase(deleteTodolistTC.fulfilled, (state, action) => {
        const index = state.findIndex((todolist) => todolist.id === action.payload.id)
        if (index !== -1) {
          state.splice(index, 1)
        }
      })
      .addCase(createTodolistTC.fulfilled, (state, action) => {
        state.unshift({ ...action.payload.todolist, filter: "all" })
      })
  },
  selectors: {
    selectTodolists: (state) => state,
  },
})

export const todolistsReducer = todolistsSlice.reducer
export const { changeTodolistFilterAC } = todolistsSlice.actions
export const { selectTodolists } = todolistsSlice.selectors

// Thunk - первый способ написания (ф-ция возвращающая другую ф-цию), более старый (написано двумя способами).
// Обёртка нужна была чтобы чуть что можно было передавать аргументы. Где (dispatch: Dispatch) сюда мы не могли ничего больше передать, а в ф-цию обёртку могли соответственно
// export const fetchTodolistsTC1 = () => (dispatch: Dispatch) => {
//   todolistsApi.getTodolists().then((res) => {
//     dispatch(fetchTodolistsAC({ todolists: res.data }))
//   })
// }
// export const fetchTodolistsTC1 = () => {
//   return (dispatch: Dispatch) => {
//     todolistsApi.getTodolists().then((res) => {
//       dispatch(fetchTodolistsAC({ todolists: res.data }))
//     })
//   }
// }

//  Thunk - второй способ написания, более новый
// export const fetchTodolistsTC = createAsyncThunk(`${todolistsSlice.name}/fetchTodolistsTC`, (_arg, { dispatch }) => {
//   // side effect
//   todolistsApi.getTodolists().then((res) => {
//     // dispatch actions
//     dispatch(fetchTodolistsAC({ todolists: res.data }))
//   })
// })

//  Thunk - третий способ написания, уже не на чистых промисах, а с async await
export const fetchTodolistsTC = createAsyncThunk(
  `${todolistsSlice.name}/fetchTodolistsTC`,
  async (_arg, { rejectWithValue }) => {
    // rejectWithValue - передаём для обработки ошибок
    try {
      const res = await todolistsApi.getTodolists()
      return { todolists: res.data }
      // dispatch(fetchTodolistsAC({ todolists: res.data })) // либо dispatch либо return res.data.
      // При dispatch не надо задействовать extraReducers, но надо отдельно расписывать где reducers fetchTodolistsAC.
      // dispatch если что берём деструктуризацией оттуда же откуда и rejectWithValue
    } catch (error) {
      return rejectWithValue(null) // попадёт в кейс обработки ошибок выше где extraReducers fetchTodolistsTC.rejected. Но мы так вроде делать не будем а будем как-то по другому
    }
  },
)

export const changeTodolistTitleTC = createAsyncThunk(
  `${todolistsSlice.name}/changeTodolistTitleTC`,
  async (args: { id: string; title: string }, { rejectWithValue }) => {
    try {
      await todolistsApi.changeTodolistTitle(args)
      return args
    } catch (error) {
      return rejectWithValue(null)
    }
  },
)

export const deleteTodolistTC = createAsyncThunk(
  `${todolistsSlice.name}/deleteTodolistTC`,
  async (id: string, { rejectWithValue }) => {
    try {
      await todolistsApi.deleteTodolist(id)
      return { id }
    } catch (error) {
      return rejectWithValue(null)
    }
  },
)

export const createTodolistTC = createAsyncThunk(
  `${todolistsSlice.name}/createTodolistAC`,
  async (title: string, { rejectWithValue }) => {
    try {
      const res = await todolistsApi.createTodolist(title)
      return { todolist: res.data.data.item }
    } catch (error) {
      return rejectWithValue(null)
    }
  },
)

// старый синтаксис
// export const _todolistsReducer = createReducer(initialState, (builder) => {
//   builder
//     .addCase(deleteTodolistAC, (state, action) => {
//       const index = state.findIndex((todolist) => todolist.id === action.payload.id)
//       if (index !== -1) {
//         state.splice(index, 1)
//       }
//     })
//     .addCase(createTodolistAC, (state, action) => {
//       state.push({ ...action.payload, filter: "all" })
//     })
//     .addCase(changeTodolistTitleAC, (state, action) => {
//       const index = state.findIndex((todolist) => todolist.id === action.payload.id)
//       if (index !== -1) {
//         state[index].title = action.payload.title
//       }
//     })
//     .addCase(changeTodolistFilterAC, (state, action) => {
//       const todolist = state.find((todolist) => todolist.id === action.payload.id)
//       if (todolist) {
//         todolist.filter = action.payload.filter
//       }
//     })
// })
//
// export const deleteTodolistAC = createAction<{ id: string }>("todolists/deleteTodolist")
// export const createTodolistAC = createAction("todolists/createTodolist", (title: string) => {
//   return { payload: { title, id: nanoid() } }
// })
// export const changeTodolistTitleAC = createAction<{ id: string; title: string }>("todolists/changeTodolistTitle")
// export const changeTodolistFilterAC = createAction<{ id: string; filter: FilterValues }>(
//   "todolists/changeTodolistFilter",
// )
