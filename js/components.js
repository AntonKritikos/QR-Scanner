Vue.component('counter', {
  template : '<div><button @click="decreaseCounter(1)">-</button>{{counter}}<button @click="increaseCounter(20)">+</button></div>',
  data: function(){
    return {counter:1}
  },
  methods: {
    increaseCounter(increaseLimit) {
      if (this.counter < increaseLimit)
        this.counter++;
    },
    decreaseCounter(decreaseLimit) {
      if (this.counter > decreaseLimit)
        this.counter--;
    }
  }
});
