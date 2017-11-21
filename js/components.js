// Component for a product counter for quantity of items
Vue.component('counter', {
  template : '<div><button @click="decreaseCounter(1)">-</button>{{counter}}<button @click="increaseCounter(20)">+</button></div>',
  data: function(){
    return {counter:1}
  },
  methods: {
    increaseCounter(increaseLimit) { // Increase
      if (this.counter < increaseLimit)
        this.counter++;
    },
    decreaseCounter(decreaseLimit) { // Decrease
      if (this.counter > decreaseLimit)
        this.counter--;
    }
  }
});
