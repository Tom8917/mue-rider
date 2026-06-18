export type RadioChannel = 'channel_1' | 'channel_2' | 'channel_3' | 'channel_4'

export type RadioTrack = {
    key: string
    title: string
    artist?: string
    file: string
}

export type RadioStation = {
    name: string
    description: string
    tracks: RadioTrack[]
}

export const RADIOS: Record<RadioChannel, RadioStation> = {
    channel_1: {
        name: 'Lowrider FM',
        description: 'US Sound',
        tracks: [
            {key: 'radio_us_1', title: 'EVERYBODY', artist: 'Kalan.FrFr', file: 'everybody.mp3'},
            {key: 'radio_us_2', title: 'My Way', artist: 'Nino Breeze', file: 'my_way.mp3'},
            {key: 'radio_us_3', title: 'Party In The Hood', artist: 'Bishop Snow', file: 'party_in_the_hood.mp3'},
            {key: 'radio_us_4', title: 'Sumn Pretty', artist: '03 Greedo', file: 'sumn_pretty.mp3'},
            {key: 'radio_us_5', title: 'Mad As F*ck', artist: 'Cordae', file: 'mad_as_f.mp3'},
            {key: 'radio_us_6', title: '5 seater', artist: '310babii', file: '5_seater.mp3'},
        ],
    },

    channel_2: {
        name: 'Grau FM',
        description: 'Brazil Sound',
        tracks: [
            {key: 'radio_br_1', title: 'Boa Sorte Good Luck', artist: 'Vanessa da Mata', file: 'boa_sorte_good_luck.mp3'},
            {key: 'radio_br_2', title: 'Montagem Sarra Sarra', artist: 'DJ Yuzak', file: 'montagem_sarra_sarra.mp3'},
            {key: 'radio_br_3', title: 'O Que Que Tu Quer', artist: 'MC Magrinho, DJ Yan do Flamengo & DJ Gebe', file: 'o_que_que_tu_quer.mp3'},
        ],
    },

    channel_3: {
        name: 'Bitume FM',
        description: 'Rap FR',
        tracks: [
            {key: 'radio_fr_1', title: 'BX Land #5', artist: 'Heuss Lenfoiré', file: 'bx_land_5.mp3'},
            {key: 'radio_fr_2', title: 'Vatos', artist: 'Timal', file: 'vatos.mp3'},
            {key: 'radio_fr_3', title: 'YMH', artist: 'Malty2bz', file: 'ymh.mp3'},
            {key: 'radio_fr_4', title: 'Entre les murs', artist: 'Da UZI', file: 'entre_les_murs.mp3'},
            {key: 'radio_fr_5', title: 'GUWOP FREESTYLE', artist: 'Dosseh', file: 'guwop_freestyle.mp3'},
            {key: 'radio_fr_6', title: 'Jerrican', artist: 'Guy2Bezbar', file: 'jerrican.mp3'},
            {key: 'radio_fr_7', title: 'C\'est moi', artist: 'Koba la D', file: 'cest_moi.mp3'},
            {key: 'radio_fr_8', title: 'Bedodo', artist: 'Koba la D', file: 'bedodo.mp3'},
            {key: 'radio_fr_9', title: '5 étoiles', artist: 'Werenoi', file: '5_etoiles.mp3'},
            {key: 'radio_fr_10', title: 'Malcolm', artist: 'Ninho', file: 'malcolm.mp3'},
            {key: 'radio_fr_11', title: 'Gâchette', artist: 'SDM', file: 'gachette.mp3'},
            {key: 'radio_fr_12', title: 'La 5', artist: 'Timal', file: 'la_5.mp3'},
        ],
    },

    channel_4: {
        name: 'Street FM',
        description: 'Rap US',
        tracks: [
            {key: 'radio_br_1', title: 'Boa Sorte Good Luck', artist: 'Vanessa da Mata', file: 'boa_sorte_good_luck.mp3'},
            {key: 'radio_br_2', title: 'Montagem Sarra Sarra', artist: 'DJ Yuzak', file: 'montagem_sarra_sarra.mp3'},
            {key: 'radio_br_3', title: 'O Que Que Tu Quer', artist: 'MC Magrinho, DJ Yan do Flamengo & DJ Gebe', file: 'o_que_que_tu_quer.mp3'},
        ],
    },
}