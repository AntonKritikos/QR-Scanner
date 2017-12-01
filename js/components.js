Vue.component('counter', {
  props:['cur-amt'],
  template : '<div class="counter"><div @click="decreaseCounter(0)">-</div><div class="countNum">{{counter}}</div><div @click="increaseCounter(20)">+</div></div>',
  data: function(){
    return {
      counter:0
    }
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
  },
  created(){
    this.counter = this.curAmt;
  }
});
