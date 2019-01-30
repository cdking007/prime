import { Field, ID, ObjectType } from 'type-graphql';
import {
  AfterLoad,
  Column,
  Entity,
  getRepository,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { GraphQLJSON } from '../types/GraphQLJSON';
import { PrimeField } from '../utils/PrimeField';
import { PrimeFieldGroup } from '../utils/PrimeFieldGroup';
import { PrimeFieldString } from '../utils/PrimeFieldString';
import { Document } from './Document';
import { Release } from './Release';
import { Schema } from './Schema';
import { Webhook } from './Webhook';

@Entity()
@ObjectType()
export class SchemaField {
  @PrimaryGeneratedColumn('uuid')
  @Field(type => ID)
  public id: string;

  @Column()
  @Field()
  public name: string;

  @Column()
  @Field()
  public title: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  public description: string;

  @Column()
  @Field()
  public type: string;

  @Column({ default: 'Main' })
  @Field()
  public group: string;

  @Column({ default: 0 })
  @Field()
  public position: number;

  @Column({ default: false })
  @Field()
  public primary: boolean;

  @Column('jsonb', { default: {} })
  @Field(type => GraphQLJSON)
  public options: any;

  @Field(type => [SchemaField], { nullable: true })
  public fields: SchemaField[];

  @Column({ nullable: true })
  public parentFieldId?: string;

  @ManyToOne(type => SchemaField, category => category.childFields)
  public parentField: SchemaField;

  @OneToMany(type => SchemaField, category => category.parentField)
  public childFields: SchemaField[];

  @Column()
  public schemaId: string;

  @ManyToOne(type => Schema, schema => schema.fields, { cascade: true, onDelete: 'SET NULL' })
  public schema: Schema;

  public primeField?: PrimeField;

  @AfterLoad()
  public setPrimeField() {
    if (!this.primeField) {
      const repositories = {
        document: getRepository(Document),
        schema: getRepository(Schema),
        schemaField: getRepository(SchemaField),
        release: getRepository(Release),
        webhook: getRepository(Webhook),
      };

      if (this.type === 'string') {
        this.primeField = new PrimeFieldString(this, repositories);
      } else if (this.type === 'group') {
        this.primeField = new PrimeFieldGroup(this, repositories);
      }
    }
  }
}