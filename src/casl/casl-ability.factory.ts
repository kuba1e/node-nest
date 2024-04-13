import {
  Ability,
  AbilityBuilder,
  AbilityClass,
  ExtractSubjectType,
  InferSubjects,
} from '@casl/ability';
import { Injectable } from '@nestjs/common';
import { Chat } from 'src/chat/chat.entity';
import { Message } from 'src/message/message.entity';
import { Actions } from 'src/types/chat';
import { User } from 'src/user/user.entity';

type Subjects =
  | InferSubjects<typeof Chat | typeof User | typeof Message>
  | 'all';

export type AppAbility = Ability<[Actions, Subjects]>;

@Injectable()
export class CaslAbilityFactory {
  createForUser(user: User) {
    const { can, cannot, build } = new AbilityBuilder<
      Ability<[Actions, Subjects]>
    >(Ability as AbilityClass<AppAbility>);

    if (user) {
      can(Actions.CREATE, Chat);
    } else {
      cannot(
        [Actions.CREATE, Actions.READ, Actions.UPDATE, Actions.REMOVE],
        'all',
      );
    }

    can([Actions.READ, Actions.UPDATE, Actions.REMOVE], Chat, {
      creatorId: user.id,
      users: {
        $elemMatch: { id: user.id },
      },
    });

    return build({
      // Read https://casl.js.org/v6/en/guide/subject-type-detection#use-classes-as-subject-types for details
      detectSubjectType: (item) =>
        item.constructor as ExtractSubjectType<Subjects>,
    });
  }
}
