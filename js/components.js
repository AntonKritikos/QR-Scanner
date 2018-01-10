Vue.component('counter', {
  props: {
    curAmt: Number,
    index: Number,
    id: String
  },
  template: '<div class="quantity"><button class="minus-btn ti-minus" type="button" @click="decreaseCounter(0)"/><input type="text" onkeypress="return event.charCode >= 48 && event.charCode <= 57" class="counterInput" v-model="counter" v-bind:value="counter"><button class="plus-btn ti-plus" type="button" @click="increaseCounter(100)"/></div>',

  data: function() {
    return {
      counter: 0
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
  created() {
    this.counter = this.curAmt;
  },
  watch: {
    counter: function (){
      if (this.counter < 0) this.counter = 0;
      if (this.counter > 100) this.counter = 100;
      if (this.$parent.page == 'basket' && this.counter != this.$parent.basket[this.index].quantity.value) {
        this.$parent.changeBasketItem(this.id, this.counter, this.index)
      }
    }
  }
});

Vue.component('terms-of-service', {
  template: '<div class="terms-of-service">{{terms}}</div>',

  data: function() {
    return {
      terms: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus feugiat, libero ut ornare posuere, massa tellus ultricies justo, vitae vulputate urna erat in nunc. Donec velit velit, feugiat vitae viverra vitae, blandit et lectus. Phasellus ultrices ullamcorper diam, posuere placerat lectus ultricies sed. Maecenas venenatis porttitor erat, at dictum nisl fringilla ac. Ut id orci quis dolor suscipit tincidunt eu at mi. Aliquam at metus in libero iaculis posuere a non metus. Phasellus a ipsum sodales massa ultrices iaculis a in diam. Curabitur varius nisi nisl, sed eleifend magna lobortis et. Nunc sollicitudin mi vel tortor dapibus euismod. Etiam tristique, dui non elementum imperdiet, purus orci fringilla odio, vehicula egestas sem tellus ac metus. Vivamus id egestas erat. Sed non euismod elit."
    }
  }
});
