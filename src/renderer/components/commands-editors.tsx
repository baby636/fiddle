import {
  Button,
  Menu,
  MenuDivider,
  MenuItem,
  Popover,
  Position,
} from '@blueprintjs/core';
import { when } from 'mobx';
import { observer } from 'mobx-react';
import * as React from 'react';

import { EditorId, GenericDialogType, MAIN_JS } from '../../interfaces';
import { getEditorTitle, getEmptyContent } from '../../utils/editor-utils';
import { AppState } from '../state';
import { EditorState, EditorMosaic } from '../editor-mosaic';

interface EditorDropdownState {
  value: string;
}

interface EditorDropdownProps {
  appState: AppState;
  editorMosaic: EditorMosaic;
}

/**
 * A dropdown allowing users to toggle the various editors
 *
 * @class EditorDropdown
 * @extends {React.Component<EditorDropdownProps, EditorDropdownState>}
 */
@observer
export class EditorDropdown extends React.Component<
  EditorDropdownProps,
  EditorDropdownState
> {
  constructor(props: EditorDropdownProps) {
    super(props);

    this.onItemClick = this.onItemClick.bind(this);
    this.showEditorDialog = this.showEditorDialog.bind(this);
    this.addEditor = this.addEditor.bind(this);
    this.removeEditor = this.removeEditor.bind(this);
  }

  public render() {
    return (
      <>
        <Popover content={this.renderMenu()} position={Position.BOTTOM}>
          <Button icon="applications" text="Editors" />
        </Popover>
      </>
    );
  }

  public renderMenu() {
    return <Menu>{...this.renderMenuItems()}</Menu>;
  }

  public renderMenuItems() {
    const { editorMosaic } = this.props;
    const { mosaicLeafCount, states } = editorMosaic;
    const result: Array<JSX.Element> = [];

    for (const [id, state] of states) {
      const title = getEditorTitle(id);
      const visible = state !== EditorState.Hidden;
      const icon = visible ? 'eye-open' : 'eye-off';

      // Can't hide last editor panel.
      const mustShow = visible && mosaicLeafCount < 2;

      if (id !== MAIN_JS) {
        result.push(
          <MenuItem
            icon={icon}
            key={id}
            text={title}
            id={id}
            onClick={this.onItemClick}
            disabled={mustShow}
          >
            <MenuItem
              icon={'cross'}
              id={id}
              onClick={this.removeEditor}
              text={'Remove'}
            />
          </MenuItem>,
        );
      } else {
        result.push(
          <MenuItem
            icon={icon}
            key={id}
            text={title}
            id={id}
            onClick={this.onItemClick}
            disabled={mustShow}
          />,
        );
      }
    }

    result.push(
      <React.Fragment key={'fragment-editor'}>
        <MenuDivider />
        <MenuItem
          icon="plus"
          key="add-editor"
          text="Add Editor"
          onClick={this.addEditor}
        />
      </React.Fragment>,
    );

    result.push(
      <React.Fragment key={'fragment-reset-layout'}>
        <MenuDivider />
        <MenuItem
          icon="grid-view"
          key="reset-layout"
          text="Reset Layout"
          onClick={editorMosaic.resetLayout}
        />
      </React.Fragment>,
    );

    return result;
  }

  public async showEditorDialog() {
    const { appState } = this.props;

    appState.setGenericDialogOptions({
      type: GenericDialogType.confirm,
      label: 'Enter a filename to add',
      wantsInput: true,
      ok: 'Create',
      cancel: 'Cancel',
      placeholder: 'file.js',
    });

    appState.toggleGenericDialog();
    await when(() => !appState.isGenericDialogShowing);

    return {
      cancelled: !appState.genericDialogLastResult,
      result: appState.genericDialogLastInput,
    };
  }

  public async addEditor() {
    const { appState, editorMosaic } = this.props;

    const { cancelled, result } = await this.showEditorDialog();
    if (cancelled) return;

    try {
      const id = result as EditorId;
      editorMosaic.add(id, getEmptyContent(id));
    } catch (error) {
      appState.setGenericDialogOptions({
        type: GenericDialogType.warning,
        label: error.message,
        cancel: undefined,
      });
      appState.toggleGenericDialog();
    }
  }

  public async removeEditor(event: React.MouseEvent) {
    const { editorMosaic } = this.props;
    const { id } = event.currentTarget;
    editorMosaic.remove(id as EditorId);
  }

  public onItemClick(event: React.MouseEvent) {
    const { editorMosaic } = this.props;
    const { id } = event.currentTarget;
    editorMosaic.toggle(id as EditorId);
  }
}
