class NoiseNameBlock extends ValueBlock {
    constructor() {
        super('noisename');
        this.setPalette('drum');
        this.formBlock({ outType: 'textout' });
        this.extraWidth = 50;
    }
}

class DrumNameBlock extends ValueBlock {
    constructor() {
        super('drumname');
        this.setPalette('drum');
        this.formBlock({ outType: 'textout' });
        this.extraWidth = 50;
    }
}

class EffectsNameBlock extends ValueBlock {
    constructor() {
        super('effectsname');
        this.setPalette('drum');
        this.formBlock({ outType: 'textout' });
        this.extraWidth = 50;
    }
}

class PlayNoiseBlock extends FlowBlock {
    constructor() {
        super('playnoise', _('noise'));
        this.setPalette('drum');
        this.formBlock({
            args: 1, defaults: [_('white noise')],
            argTypes: ['anyin'],
        });
        this.makeMacro((x, y) => [
            [0, 'playnoise', x, y, [null, 1, null]],
            [1, ['noisename', {'value': DEFAULTNOISE}], 0, 0, [0]]
        ]);
    }

    flow(args, logo, turtle, blk) {
        let arg;
        if (args.length !== 1 || args[0] == null || typeof(args[0]) !== 'string') {
            logo.errorMsg(NOINPUTERRORMSG, blk);
            arg = 'noise1';
        } else {
            arg = args[0];
        }

        let noisename = arg;
        for (let noise in NOISENAMES) {
            if (NOISENAMES[noise][0] === arg) {
                noisename = NOISENAMES[noise][1];
                break;
            } else if (NOISENAMES[noise][1] === arg) {
                noisename = arg;
                break;
            }
        }

        if (logo.inNoteBlock[turtle].length > 0) {
            // Add the noise sound as if it were a drum
            logo.noteDrums[turtle][last(logo.inNoteBlock[turtle])].push(noisename);
            if (logo.synthVolume[turtle][noisename] == undefined) {
                logo.synthVolume[turtle][noisename] = [DEFAULTVOLUME];
                logo.crescendoInitialVolume[turtle][noisename] = [DEFAULTVOLUME];
            }
        } else {
            logo.errorMsg(_('Noise Block: Did you mean to use a Note block?'), blk);
            return;
        }

        if (logo.inNoteBlock[turtle].length > 0) {
            logo.noteBeatValues[turtle][last(logo.inNoteBlock[turtle])].push(logo.beatFactor[turtle]);
        }

        logo.pushedNote[turtle] = true;
    }
}

function _createPlayDrumMacros() {
    class PlayDrumMacroBlock extends FlowBlock {
        constructor(name, displayName, isDrum, drumName) {
            super(name, _(name || displayName));
            this.setPalette('drum');
            this.formBlock({ args: 1 });
            this.makeMacro((x, y) => [
                [0, 'playdrum', x, y, [null, 1, null]],
                [1, [isDrum ? 'drumname' : 'effectsname', {'value': drumName || isDrum ? (displayName || name) : name}], 0, 0, [0]]
            ]);
        }
    }

    new PlayDrumMacroBlock('duck').setup();
    new PlayDrumMacroBlock('cat').setup();
    new PlayDrumMacroBlock('cricket').setup();
    new PlayDrumMacroBlock('dog').setup();
    new PlayDrumMacroBlock('bottle').setup();
    new PlayDrumMacroBlock('bubbles').setup();
    // Legacy typo
    new PlayDrumMacroBlock('chine', 'chime', true).setup();
    new PlayDrumMacroBlock('clang').setup();
    new PlayDrumMacroBlock('clap').setup();
    new PlayDrumMacroBlock('slap').setup();
    new PlayDrumMacroBlock('crash').setup();
    new PlayDrumMacroBlock('splash').setup();
    new PlayDrumMacroBlock('cowbell', 'cow bell', true).setup();
    new PlayDrumMacroBlock('ridebell', 'ride bell', true).setup();
    new PlayDrumMacroBlock('fingercymbals', 'finger cymbals', true).setup();
    new PlayDrumMacroBlock('trianglebell', 'triangle bell', true).setup();
    new PlayDrumMacroBlock('hihat', 'hi hat', true).setup();
    new PlayDrumMacroBlock('darbuka', 'darbuka drum', true).setup();
    new PlayDrumMacroBlock('cup', 'cup drum', true).setup();
    new PlayDrumMacroBlock('floortom', 'floor tom', true, 'floor tom tom').setup();
    new PlayDrumMacroBlock('tom', 'tom tom', true).setup();
    new PlayDrumMacroBlock('kick', 'kick drum', true).setup();
    new PlayDrumMacroBlock('snare', 'snare drum', true).setup();
}

class MapDrumBlock extends FlowClampBlock {
    constructor() {
        super('mapdrum');
        this.setPalette('drum');
        this.formBlock({
            //.TRANS: map a pitch to a drum sound
            name: _('map pitch to drum'),
            args: 1, argTypes: ['anyin'],
        });
        this.makeMacro((x, y) => [
            [0, 'mapdrum', x, y, [null, 1, 3, 2]],
            [1, ['drumname', {'value': 'kick drum'}], 0, 0,[0]],
            [2, 'hidden', 0, 0, [0, null]],
            [3, 'pitch', 0, 0, [0, 4, 5, null]],
            [4, ['solfege', {'value': 'sol'}], 0, 0, [3]],
            [5, ['number', {'value': 4}], 0, 0, [3]]
        ]);
    }

    flow(args, logo, turtle, blk) {
        var drumname = DEFAULTDRUM;
        for (var drum in DRUMNAMES) {
            if (DRUMNAMES[drum][0] === args[0]) {
                drumname = DRUMNAMES[drum][1];
            } else if (DRUMNAMES[drum][1] === args[0]) {
                drumname = args[0];
            }
        }

        logo.drumStyle[turtle].push(drumname);

        var listenerName = '_mapdrum_' + turtle;
        logo._setDispatchBlock(blk, turtle, listenerName);

        var __listener = function (event) {
            logo.drumStyle[turtle].pop();
        };

        logo._setListener(turtle, listenerName, __listener);
        if (logo.inRhythmRuler) {
            logo._currentDrumBlock = blk;
            logo.rhythmRuler.Drums.push(blk);
            logo.rhythmRuler.Rulers.push([[],[]]);
        }

        return [args[1], 1];
    }
}

class SetDrumBlock extends FlowClampBlock {
    constructor() {
        super('setdrum');
        this.setPalette('drum');
        this.formBlock({
            //.TRANS: set the current drum sound for playback
            name: _('set drum'),
            args: 1, argTypes: ['anyin'],
        });
        this.makeMacro((x, y) => [
            [0, 'setdrum', x, y, [null, 1, 2, 7]],
            [1, ['drumname', {'value': DEFAULTDRUM}], 0, 0, [0]],
            [2, 'rhythm2', 0, 0, [0, 3, 4, null]],
            [3, ['number', {'value': 1}], 0, 0, [2]],
            [4, 'divide', 0, 0, [2, 5, 6]],
            [5, ['number', {'value': 1}], 0, 0, [4]],
            [6, ['number', {'value': 1}], 0, 0, [4]],
            [7, 'hidden', 0, 0, [0, null]]
        ]);
    }

    flow(args, logo, turtle, blk) {
        var drumname = DEFAULTDRUM;
        for (var drum in DRUMNAMES) {
            if (DRUMNAMES[drum][0] === args[0]) {
                drumname = DRUMNAMES[drum][1];
            } else if (DRUMNAMES[drum][1] === args[0]) {
                drumname = args[0];
            }
        }

        logo.drumStyle[turtle].push(drumname);

        var listenerName = '_setdrum_' + turtle;
        logo._setDispatchBlock(blk, turtle, listenerName);

        var __listener = function (event) {
            var drumname = logo.drumStyle[turtle].pop();
            logo.pitchDrumTable[turtle] = {};
        };

        logo._setListener(turtle, listenerName, __listener);
        if (logo.inRhythmRuler) {
            logo._currentDrumBlock = blk;
            logo.rhythmRuler.Drums.push(blk);
            logo.rhythmRuler.Rulers.push([[],[]]);
        }

        return [args[1], 1];
    }
}

class PlayEffectBlock extends FlowBlock {
    constructor() {
        super('playeffect', _('sound effect'));
        this.setPalette('drum');
        this.formBlock({ args: 1, argTypes: ['anyin'] });
        this.makeMacro((x, y) => [
            [0, 'playdrum', x, y, [null, 1, null]],
            [1, ['effectsname', {'value': DEFAULTEFFECT}], 0, 0, [0]]
        ]);
    }
}

class PlayDrumBlock extends FlowBlock {
    constructor() {
        super('playdrum', _('drum'));
        this.setPalette('drum');
        this.formBlock({ args: 1, argTypes: ['anyin'] });
        this.makeMacro((x, y) => [
            [0, 'playdrum', x, y, [null, 1, null]],
            [1, ['drumname', {'value': DEFAULTDRUM}], 0, 0, [0]]
        ]);
    }

    flow(args, logo, turtle, blk) {
        if (args.length !== 1 || args[0] == null || typeof(args[0]) !== 'string') {
            logo.errorMsg(NOINPUTERRORMSG, blk);
            var arg = DEFAULTDRUM;
        } else {
            var arg = args[0];
        }

        var drumname = DEFAULTDRUM;
        if (arg.slice(0, 4) === 'http') {
            drumname = arg;
        } else {
            for (var drum in DRUMNAMES) {
                if (DRUMNAMES[drum][0] === arg) {
                    drumname = DRUMNAMES[drum][1];
                    break;
                } else if (DRUMNAMES[drum][1] === arg) {
                    drumname = arg;
                    break;
                }
            }
        }

        // If we are in a setdrum clamp, override the drum name.
        if (logo.drumStyle[turtle].length > 0) {
            drumname = last(logo.drumStyle[turtle]);
        }

        if (logo.inPitchDrumMatrix) {
            logo.pitchDrumMatrix.drums.push(drumname);
            logo.pitchDrumMatrix.addColBlock(blk);
            if (logo.drumBlocks.indexOf(blk) === -1) {
                logo.drumBlocks.push(blk);
            }
        } else if (logo.inMatrix) {
            logo.pitchTimeMatrix.rowLabels.push(drumname);
            logo.pitchTimeMatrix.rowArgs.push(-1);

            logo.pitchTimeMatrix.addRowBlock(blk);
            if (logo.drumBlocks.indexOf(blk) === -1) {
                logo.drumBlocks.push(blk);
            }
        } else if (logo.inNoteBlock[turtle].length > 0) {
            logo.noteDrums[turtle][last(logo.inNoteBlock[turtle])].push(drumname);
            if (logo.synthVolume[turtle][drumname] == undefined) {
                logo.synthVolume[turtle][drumname] = [DEFAULTVOLUME];
                logo.crescendoInitialVolume[turtle][drumname] = [DEFAULTVOLUME];
            }
        } else if (logo.blocks.blockList[blk].connections[0] == null && last(logo.blocks.blockList[blk].connections) == null) {
            // Play a stand-alone drum block as a quarter note.
            logo.clearNoteParams(turtle, blk, []);
            logo.inNoteBlock[turtle].push(blk);
            logo.noteDrums[turtle][last(logo.inNoteBlock[turtle])].push(drumname);

            if (logo.bpm[turtle].length > 0) {
                var bpmFactor = TONEBPM / last(logo.bpm[turtle]);
            } else {
                var bpmFactor = TONEBPM / logo._masterBPM;
            }

            var noteBeatValue = 4;
            var beatValue = bpmFactor / noteBeatValue;

            __callback = function () {
                var j = logo.inNoteBlock[turtle].indexOf(blk);
                logo.inNoteBlock[turtle].splice(j, 1);
            };

            logo._processNote(noteBeatValue, blk, turtle, __callback);
        } else {
            logo.errorMsg(_('Drum Block: Did you mean to use a Note block?'), blk);
            return;
        }

        if (logo.inNoteBlock[turtle].length > 0) {
            logo.noteBeatValues[turtle][last(logo.inNoteBlock[turtle])].push(logo.beatFactor[turtle]);
        }

        logo.pushedNote[turtle] = true;
    }
}

function setupDrumBlocks() {
    new NoiseNameBlock().setup();
    new DrumNameBlock().setup();
    new EffectsNameBlock().setup();
    new PlayNoiseBlock().setup();
    _createPlayDrumMacros();
    new MapDrumBlock().setup();
    new SetDrumBlock().setup();
    new PlayEffectBlock().setup();
    new PlayDrumBlock().setup();
}
