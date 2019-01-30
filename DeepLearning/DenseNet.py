# -*- coding: utf-8 -*-
"""
Created on Sat Nov 17 21:57:51 2018

@author: VRDesktrop
"""

import tensorflow as tf
from tflearn.layers.conv import global_avg_pool
from tensorflow.contrib.layers import batch_norm, flatten
from tensorflow.contrib.layers import xavier_initializer
from tensorflow.contrib.framework import arg_scope
import numpy as np


class DenseNet():
    def __init__(self, x, nb_blocks, filters, training, image_size, class_num):
        self.nb_blocks = nb_blocks
        self.filters = filters
        self.training = training
        #self.model = self.Dense_net(x)
        self.class_num = class_num
        self.image_size = image_size
        
    def createModel(self, x):
        self.model = self.Dense_net(x)
        #return self.Dense_net(x)
        
    # Note: nb-block = how many (dense block + transition layer)
    # batch_size * iteration = data_set_number
    def defineHyperParameters(self, growth_k=24, nb_block=2, init_learning_rate=1e-4, epsilon=1e-4, dropout_rate=0.2,
                              nesterov_momentum=0.9, weight_decay=1e-4, batch_size=64, iteration=782,test_iteration=10, total_epochs=300):
        self.growth_k = growth_k
        self.nb_block = nb_block
        self.init_learning_rate = init_learning_rate
        self.epsilon = epsilon
        self.dropout_rate = dropout_rate
        
        self.nesterov_momentum = nesterov_momentum
        self.weight_decay = weight_decay
        
        self.batch_size = batch_size
        self.iteration = iteration
        self.test_iteration = test_iteration
        self.total_epochs = total_epochs

    def defineTestingData(self, test_data, test_label):
        self.test_x = test_data
        self.test_y = test_label
        
    def defineDictItems(self, label, x, epoch_learning_rate, learning_rate, cost, accuracy, training_flag):
        self.label = label
        self.cost = cost
        self.accuracy = accuracy
        self.epoch_learning_rate = epoch_learning_rate
        self.learning_rate = learning_rate
        self.x = x
        self.training_flag = training_flag
        
    # Create Convolution Layer
    def conv_layer(self, input, filter, kernel, stride=1, layer_name="conv"):
        with tf.name_scope(layer_name):
            network = tf.layers.conv2d(inputs=input, use_bias=False, filters=filter, kernel_size=kernel, strides=stride, padding='SAME')
            return network
        
    # Define Global Average Pooling
    def Global_Average_Pooling(self, x, stride=1):
        #print(x.get_shape().as_list())
        return global_avg_pool(x, name='Global_avg_pooling')
    
        ## If the above fails, use:
        """
        width = np.shape(x)[1]
        height = np.shape(x)[2]
        pool_size = [width, height]
        return tf.layers.average_pooling2d(inputs=x, pool_size=pool_size, strides=stride) # The stride value does not matter
        It is global average pooling without tflearn
        """
    
    def Batch_Normalization(self, x, training, scope):
        with arg_scope([batch_norm],
                       scope = scope, updates_collections=None, decay=0.9, center=True, scale=True, zero_debias_moving_mean=True):
            return tf.cond(training, lambda: batch_norm(inputs=x, is_training=training, reuse=None),
                           lambda : batch_norm(inputs=x, is_training=training, reuse=None))
            
    def Drop_out(self, x, rate, training):
        return tf.layers.dropout(inputs=x, rate=rate, training=training)
    
    def Relu(self, x):
        return tf.nn.relu(x)
    
    def Average_pooling(self, x, pool_size=[2,2], stride=2, padding='VALID'):
        return tf.layers.average_pooling2d(inputs=x, pool_size=pool_size, strides=stride, padding=padding)


    def Max_Pooling(self, x, pool_size=[3,3], stride=2, padding='VALID'):
        return tf.layers.max_pooling2d(inputs=x, pool_size=pool_size, strides=stride, padding=padding)

    def Concatenation(self, layers) :
        return tf.concat(layers, axis=3)

    def Linear(self, x) :
        return tf.layers.dense(inputs=x, units=self.class_num, name='linear')

    def Evaluate(self, sess):
        test_acc = 0.0
        test_loss = 0.0
        test_pre_index = 0
        add = 1000
        
        for it in range(self.test_iteration):
            test_batch_x = self.test_x[test_pre_index: test_pre_index + add]
            test_batch_y = self.test_y[test_pre_index: test_pre_index + add]
            test_pre_index = test_pre_index + add
            
            test_feed_dict = {
                    self.x: test_batch_x,
                    self.label: test_batch_y,
                    self.learning_rate: self.epoch_learning_rate,
                    self.training_flag: False
            }
            
            loss_, acc_ = sess.run([self.cost, self.accuracy], feed_dict=test_feed_dict)
            
            test_loss += loss_ / 10.0
            test_acc += acc_ / 10.0
            
        summary = tf.Summary(value=[tf.Summary.Value(tag='test_loss', simple_value=test_loss),
                                    tf.Summary.Value(tag='test_accuracy', simple_value=test_acc)])
    
        return test_acc, test_loss, summary
    
        
    # Bottleneck layer - create two units that perform similar functional;iity.
    def bottleneck_layer(self, x, scope):
        with tf.name_scope(scope):
            # Unit 1 - 1x1 Convolution Layer Preceded by Batch Normalization, Relu, and followed with a Droupout
            x = self.Batch_Normalization(x, training=self.training, scope=scope+'_batch1')
            x = self.Relu(x)
            x = self.conv_layer(x, filter=4 * self.filters, kernel=[1,1], layer_name=scope+'_conv1')
            x = self.Drop_out(x, rate=self.dropout_rate, training=self.training)

            # Unit 2 - Utilizing a 3x3 Convolution layer, same as above
            x = self.Batch_Normalization(x, training=self.training, scope=scope+'_batch2')
            x = self.Relu(x)
            x = self.conv_layer(x, filter=self.filters, kernel=[3,3], layer_name=scope+'_conv2')
            x = self.Drop_out(x, rate=self.dropout_rate, training=self.training)
            return x

    def transition_layer(self, x, scope):
        with tf.name_scope(scope):
            x = self.Batch_Normalization(x, training=self.training, scope=scope+'_batch1')
            x = self.Relu(x)
            x = self.conv_layer(x, filter=self.filters, kernel=[1,1], layer_name=scope+'_conv1')
            x = self.Drop_out(x, rate=self.dropout_rate, training=self.training)
            x = self.Average_pooling(x, pool_size=[2,2], stride=2)

            return x

    def dense_block(self, input_x, nb_layers, layer_name):
        with tf.name_scope(layer_name):
            layers_concat = list()
            layers_concat.append(input_x)

            x = self.bottleneck_layer(input_x, scope=layer_name + '_bottleN_' + str(0))

            layers_concat.append(x)

            for i in range(nb_layers - 1):
                x = self.Concatenation(layers_concat)
                x = self.bottleneck_layer(x, scope=layer_name + '_bottleN_' + str(i + 1))
                layers_concat.append(x)

            x = self.Concatenation(layers_concat)

            return x

    def Dense_net(self, input_x):
        x = self.conv_layer(input_x, filter=2 * self.filters, kernel=[7,7], stride=2, layer_name='conv0')
        x = self.Max_Pooling(x, pool_size=[3,3], stride=2)


        # A for loop could be used here, but the need to fill the nb_layers constraint prevents that at the moment.

        x = self.dense_block(input_x=x, nb_layers=6, layer_name='dense_1')
        x = self.transition_layer(x, scope='trans_1')

        x = self.dense_block(input_x=x, nb_layers=12, layer_name='dense_2')
        x = self.transition_layer(x, scope='trans_2')

        x = self.dense_block(input_x=x, nb_layers=24, layer_name='dense_3') #48
        x = self.transition_layer(x, scope='trans_3')

        x = self.dense_block(input_x=x, nb_layers=16, layer_name='dense_final') #32



        # 100 Layer
        x = self.Batch_Normalization(x, training=self.training, scope='linear_batch')
        x = self.Relu(x)
        x = self.Global_Average_Pooling(x)
       
        x = flatten(x)
        x = self.Linear(x)


        # x = tf.reshape(x, [-1, 10])
        return x