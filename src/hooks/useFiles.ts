import { RefObject, useEffect, useRef, useState } from 'react'
import { v4 } from 'uuid'

type TimeoutManager = {
  currentTimeout: number | undefined
  editingFileID: string | undefined
}

const useFiles = () => {
  const [files, setFiles] = useState<MarkeeFile[]>([]);

  const inputRef: RefObject<HTMLInputElement> = useRef(null)

  const timeoutManager = useRef<TimeoutManager>({ 
    currentTimeout: undefined,
    editingFileID: undefined
  })

  useEffect(() => {

    /* 
      It should update to "saved" if and only if the file is not being edited again.
      It should be cleaned up if and only if the same file is being edited.
    */

    const activeFile = files.find(file => file.active);

    function updateStatus (activeFile: MarkeeFile) {
      // Start Timeout
      timeoutManager.current.currentTimeout =  window.setTimeout(() => {
        setFiles(prevState => prevState.map(file => {
          if(file.id === activeFile!.id) file.status = 'saving'
          return file
        }))

        // Save File

        // Notify after delay that it was saved
        timeoutManager.current.currentTimeout = window.setTimeout(() => {
          setFiles(prevState => prevState.map(file => {
            if(file.id === activeFile!.id) file.status = 'saved'
            return file
          }))
        }, 300)
      }, 300)
    }

    if(activeFile && activeFile.status === 'editing') updateStatus(activeFile)
    

  }, [files])

  const actions = {
    createFile: (file: Partial<MarkeeFile> = {}) => {
      const defaultFile: MarkeeFile = {
        id: v4(),
        name: 'Untitled',
        content: '',
        active: true,
        status: 'saved'
      }

      setFiles((prevState) => prevState
      .map(oldFile => ({
        ...oldFile,
        active: false,
      }))
      .concat({
        ...defaultFile,
        ...file,
        active: true
      }))

      inputRef.current?.focus()
    },
    readFile: (ID: string) => {
      setFiles((prevState) => prevState.map(oldFile => {
        if(oldFile.id === ID) 
        {
          return {
            ...oldFile,
            active: true,
          }
        } 

        return {
          ...oldFile,
          active: false,
        }
      }))

      inputRef.current?.focus()
    },
    updateFile: (file: MarkeeFile) => {
      if(file.id === timeoutManager.current.editingFileID) {
        // If we continue editing the same file, we should clear the timeout
        clearTimeout(timeoutManager.current.currentTimeout)
      }

      timeoutManager.current.editingFileID = file.id

      setFiles((prevState) => prevState.map(oldFile => {
        if(file.id === oldFile.id) {
          file.status = 'editing'
          return file
        }

        return oldFile;
      }))
    },
    deleteFile: (ID: string) => {
      setFiles((prevState) => prevState.filter(oldFile => oldFile.id !== ID))
    }
  }

  return {
    files,
    actions,
    inputRef
  }
}

export { useFiles }