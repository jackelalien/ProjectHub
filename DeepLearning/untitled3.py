# -*- coding: utf-8 -*-
"""
Created on Sun Nov 18 20:00:01 2018

@author: VRDesktrop
"""

# Graph Input
X = tf.placeholder("float", [None, input_size])
Y = tf.placeholder("float", [None, num_classes_primary])
keep_prob = tf.placeholder(tf.float32)

# Set up our input data
# We need training data, training labels, test data, test labels

# Set up our variables, GET IMAGE SIZE AND IMAGE CHANNELS
x = tf.placeholder(tf.float32, shape=[None, image_size, image_size, img_channels])
label = tf.placeholder(tf.float32, shape=[None, num_classes_primary])
training_flag = tf.placeholder(tf.bool)
learning_rate = tf.placeholder(tf.float32, name='learning_rate')


#logits = DN.DenseNet(x=x, nb_blocks=nb_block, filters=growth_k, training=training_flag, image_size=image_size class_num=num_classes_primary).model
logits = DN.DenseNet(x, nb_block, growth_k, training_flag, image_size, num_classes_primary).model
cost = tf.reduce_mean(tf.nn.softmax_cross_entropy_with_logits(labels=label, logits=logits))



#tf.summary.scalar('loss', loss)
        #regularization_loss = sum(tf.get_collection("regularzation_loss"))
        #tf.summary.scalar('regularzation_loss', regularization_loss)
    
        #total_loss = regularization_loss + loss
        #tf.summary.scalar('total_loss', total_loss)
    
        #global_step = tf.Variable(0, name='global_step', trainable=False)
    
        #exp_decay_steps = 2000
        #exp_decay_rate = 0.5
    
        #learning_rate = tf.train.exponential_decay(learning_rate=init_learning_rate,
         #                                      global_step=global_step,
          #                                     decay_steps=exp_decay_steps,
           #                                    decay_rate=exp_decay_rate,
            #                                   staircase=True)
        #tf.summary.scalar('learning_rate', learning_rate)
    
    
    #train_step = tf.train.GradientDescentOptimizer(learning_rate).minimize(loss=total_loss, global_step=global_step)

        #summary_op = tf.summary.merge_all()  # merge all summaries into a single "operation" which we can execute in a session
        
        
#config = tf.ConfigProto()
        #config.gpu_options.allow_growth = True
    
        #sess = tf.Session(config=config)
        #summary_writer = tf.summary.FileWriter("./log", sess.graph)
        #sess.run(tf.global_variables_initializer())
    
        #checkpoint = tf.train.get_checkpoint_state('./models')
       # if checkpoint != None:
        #    tf.logging.info("Restoring full model from checkpoint file %s", checkpoint.model_checkpoint_path)
        #    saver.resotre(sess, checkpoint.model_checkpoint_path)
        
        #coord = tf.train.Coordinator()
        #threads = tf.train.start_queue_runners(coord=coord, sess=sess)
    
        #check_points = 5000
        #for epoch in range(250):
        #    for check_point in range(check_points):
        #        img_batch_train, label_batch_train = sess.run([image_batch, label_batch])
        #    
        #        _, training_loss, _global_step, summary = sess.run([train_step, loss, global_step, summary_op],
        #                                         feed_dict={x: img_batch_train,
        #                                                    labels: label_batch_train,
        #                                                    t_flag: if_training})
    #
        #        if(bool(check_point%50 == 0) & bool(check_point != 0)):
        #            print(_)
        #            print("batch: ", check_point + epoch * check_points)
        #            print("training loss: ", training_loss)
        #            summary_writer.add_summary(summary, _global_step)
                
        #        saver.save(sess, "./models/densenet.ckpt", _global_step)
        
   # coord.request_stop()
    #coord.join(threads)
   # sess.close()
  #  return 0