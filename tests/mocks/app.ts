import { EditorMosaicMock } from './editor-mosaic';
import { FileManager } from './file-manager';
import { MockState } from './state';
import { MonacoEditorMock } from './monaco-editor';
import { RemoteLoader } from './remote-loader';
import { RunnerMock } from './runner';
import { createEditorValues } from './editor-values';

export class AppMock {
  public setup = jest.fn();
  public replaceFiddle = jest.fn();
  public setEditorValues = jest.fn();
  public getEditorValues = jest.fn().mockImplementation(() => {
    return Promise.resolve(createEditorValues());
  });
  public loadTheme = jest.fn();
  public openFiddle = jest.fn();

  public typeDefDisposable = {
    dispose: jest.fn(),
  };

  public editorMosaic = new EditorMosaicMock();
  public fileManager = new FileManager();
  public remoteLoader = new RemoteLoader();
  public runner = new RunnerMock();
  public state = new MockState();
  public taskRunner = {};

  public monaco: any = {
    latestEditor: null,
    latestModel: null,
    editor: {
      create: jest
        .fn()
        .mockImplementation(
          () => (this.monaco.latestEditor = new MonacoEditorMock()),
        ),
      createModel: jest
        .fn()
        .mockImplementation(
          () => (this.monaco.latestModel = { updateOptions: jest.fn() }),
        ),
      onDidFocusEditorText: jest.fn(),
      setTheme: jest.fn(),
      defineTheme: jest.fn(),
    },
    languages: {
      typescript: {
        javascriptDefaults: {
          addExtraLib: jest.fn(),
        },
      },
    },
  };
}
