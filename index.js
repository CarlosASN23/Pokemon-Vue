const { createApp } = Vue;

createApp({
    data() {
        return {
            pokemons: [],
            loading: true,
            searchText: '',
            nextPage: 1,
        }
    },
    created() {
        console.log("Componente criado.");
        this.callAPI();
        window.addEventListener('scroll', this.handleScroll);
    },
    beforeUnmount() {
        window.removeEventListener('scroll', this.handleScroll);
    },
    computed: {
        filteredPokemons() {
            console.log("Filtrando pokémons:", this.searchText);
            return this.pokemons.filter(pokemon => pokemon.name.toLowerCase().includes(this.searchText.toLowerCase()));
        }
    },
    methods: {
        async callAPI() {
            console.log("Chamando API...");
            try {
                const response = await fetch(`https://pokeapi.co/api/v2/pokemon/?offset=${(this.nextPage - 1) * 151}&limit=${151}`);
                if (!response.ok) throw new Error("Erro na resposta da API");
                const data = await response.json();
                const pokemonDetailsPromises = data.results.map(pokemon => this.fetchPokemonData(pokemon.url));
                const pokemonDetails = await Promise.all(pokemonDetailsPromises);
                this.pokemons = [...this.pokemons, ...pokemonDetails];
                this.nextPage++;
                this.loading = false;
                console.log("Pokémons carregados:", this.pokemons);
            } catch (error) {
                console.error("Erro na chamada da API:", error);
                this.loading = false;
            }
        },
        async fetchPokemonData(url) {
            console.log("Buscando dados do Pokémon:", url);
            try {
                const response = await fetch(url);
                if (!response.ok) throw new Error("Erro ao buscar dados do Pokémon");
                const data = await response.json();
                return {
                    id: data.id,
                    name: data.name,
                    weight: data.weight,
                    types: data.types || [],
                    sprites: data.sprites,
                    showDetails: false,
                }
            } catch (e) {
                console.error("Erro ao buscar dados do Pokémon:", e);
                return null;
            }
        },
        handleScroll() {
            const bottomOfWindow = Math.ceil(window.innerHeight + window.scrollY) >= document.documentElement.scrollHeight;
            if (bottomOfWindow && !this.loading) {
                console.log("Chegou ao fim da página, carregando mais...");
                this.loading = true;
                this.callAPI();
            }
        },
        getTypeClass(pokemon) {
            if (!pokemon || !pokemon.types || pokemon.types.length === 0) {
                return '';
            }
            if (pokemon.types.length > 1) {
                return `${pokemon.types[0].type.name}-${pokemon.types[1].type.name}`;
            }
            return pokemon.types[0].type.name;
        }
    }
}).mount("#app");
